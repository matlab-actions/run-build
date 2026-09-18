// Copyright 2026 The MathWorks, Inc.

import { jest } from "@jest/globals";
import * as realFs from "fs";
import * as crypto from "crypto";
import { CacheState } from "./cache-state.js";

// Setup all mocks for fs, @actions/cache, @actions/core, and @actions/github.
// Also capture the current environment to restore between test cases.

// fs mocks
const existsSyncMock = jest.fn<(path: realFs.PathLike) => boolean>();
jest.unstable_mockModule("fs", () => ({
    ...realFs,
    existsSync: existsSyncMock,
}));

// @actions/cache mocks
const restoreCacheMock =
    jest.fn<
        (paths: string[], primaryKey: string, restoreKeys?: string[]) => Promise<string | undefined>
    >();
const saveCacheMock = jest.fn<(paths: string[], key: string) => Promise<number>>();
jest.unstable_mockModule("@actions/cache", () => ({
    restoreCache: restoreCacheMock,
    saveCache: saveCacheMock,
}));

// @actions/core mocks
const saveStateMock = jest.fn();
const infoMock = jest.fn();
const warningMock = jest.fn();
const debugMock = jest.fn();
jest.unstable_mockModule("@actions/core", () => ({
    saveState: saveStateMock,
    info: infoMock,
    warning: warningMock,
    debug: debugMock,
    getInput: (name: string) => process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "",
    getState: (name: string) => process.env[`STATE_${name}`] || "",
}));

// @actions/github mocks
const context: { payload: { repository?: { default_branch?: string } }; ref: string } = {
    payload: {},
    ref: "",
};
jest.unstable_mockModule("@actions/github", () => ({ context }));

// Resolve imports after mocks
const cache = await import("./cache.js");

// Reusable value for the job-matrix-json input for test cases
const JOB_MATRIX_JSON_INPUT = "INPUT_JOB-MATRIX-JSON";

function matrixHash(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

// Restore environment and mocks for each test
const savedEnv = { ...process.env };

beforeEach(() => {
    existsSyncMock.mockReset();
    restoreCacheMock.mockReset();
    saveCacheMock.mockReset();
    saveCacheMock.mockResolvedValue(0);
    saveStateMock.mockReset();
    infoMock.mockReset();
    warningMock.mockReset();
    debugMock.mockReset();
});

afterEach(() => {
    process.env = { ...savedEnv };
    context.payload = {};
    context.ref = "";
});

describe("cache key generation", () => {
    it("builds a per-commit primary key scoped by OS, job, and matrix context", () => {
        process.env.RUNNER_OS = "Linux";
        process.env.GITHUB_JOB = "build";
        process.env.GITHUB_SHA = "abc123";
        process.env[JOB_MATRIX_JSON_INPUT] = '{"matlab":"R2024a"}';

        const { primaryKey, restoreKeys } = cache.getCacheKey();
        const hash = matrixHash('{"matlab":"R2024a"}');

        expect(primaryKey).toBe(`matlab-buildtool-Linux-build-${hash}-abc123`);
        expect(restoreKeys).toEqual([`matlab-buildtool-Linux-build-${hash}-`]);
    });

    it("scopes the key by job so separate jobs in a workflow do not collide", () => {
        process.env.RUNNER_OS = "Linux";
        process.env.GITHUB_SHA = "abc123";

        process.env.GITHUB_JOB = "build";
        const jobA = cache.getCacheKey();
        process.env.GITHUB_JOB = "test";
        const jobB = cache.getCacheKey();

        expect(jobA.primaryKey).not.toBe(jobB.primaryKey);
        expect(jobA.restoreKeys).not.toEqual(jobB.restoreKeys);
    });

    it("scopes the key by matrix context", () => {
        process.env.RUNNER_OS = "Linux";
        process.env.GITHUB_JOB = "build";
        process.env.GITHUB_SHA = "abc123";

        process.env[JOB_MATRIX_JSON_INPUT] = '{"matlab":"R2023b"}';
        const jobA = cache.getCacheKey();
        process.env[JOB_MATRIX_JSON_INPUT] = '{"matlab":"R2024a"}';
        const jobB = cache.getCacheKey();

        expect(jobA.primaryKey).not.toBe(jobB.primaryKey);
        expect(jobA.restoreKeys).not.toEqual(jobB.restoreKeys);
    });

    it("falls back to the platform and empty scope when the GitHub env vars are absent", () => {
        delete process.env.RUNNER_OS;
        delete process.env.GITHUB_JOB;
        delete process.env.GITHUB_SHA;
        delete process.env[JOB_MATRIX_JSON_INPUT];

        const { primaryKey, restoreKeys } = cache.getCacheKey();
        const hash = matrixHash("");

        expect(primaryKey).toBe(`matlab-buildtool-${process.platform}--${hash}-`);
        expect(restoreKeys).toEqual([`matlab-buildtool-${process.platform}--${hash}-`]);
    });

    it("restore key is a prefix of the primary key", () => {
        process.env.RUNNER_OS = "Windows";
        process.env.GITHUB_JOB = "build";
        process.env.GITHUB_SHA = "abc123";

        const { primaryKey, restoreKeys } = cache.getCacheKey();

        expect(primaryKey.startsWith(restoreKeys[0])).toBe(true);
    });
});

describe("cache restore", () => {
    beforeEach(() => {
        process.env.RUNNER_OS = "Linux";
        process.env.GITHUB_JOB = "build";
        process.env.GITHUB_SHA = "abc123";
        process.env[JOB_MATRIX_JSON_INPUT] = "{}";
    });

    it("restores with the primary key and the prefix restore key", async () => {
        restoreCacheMock.mockResolvedValue(undefined);
        const { primaryKey, restoreKeys } = cache.getCacheKey();

        await cache.restoreCache();

        expect(restoreCacheMock).toHaveBeenCalledWith([".buildtool"], primaryKey, restoreKeys);
    });

    it("records the primary key and a read-only state on a feature branch", async () => {
        context.payload = { repository: { default_branch: "main" } };
        context.ref = "refs/heads/feature";
        restoreCacheMock.mockResolvedValue(undefined);

        await cache.restoreCache();

        expect(saveStateMock).toHaveBeenCalledWith(
            CacheState.PrimaryKey,
            expect.stringContaining("abc123"),
        );
        expect(saveStateMock).toHaveBeenCalledWith(CacheState.ShouldWrite, "false");
    });

    it("records a writable state on the default branch", async () => {
        context.payload = { repository: { default_branch: "main" } };
        context.ref = "refs/heads/main";
        restoreCacheMock.mockResolvedValue(undefined);

        await cache.restoreCache();

        expect(saveStateMock).toHaveBeenCalledWith(CacheState.ShouldWrite, "true");
    });

    it("records a read-only state on a pull request merge ref", async () => {
        context.payload = { repository: { default_branch: "main" } };
        context.ref = "refs/pull/42/merge";
        restoreCacheMock.mockResolvedValue(undefined);

        await cache.restoreCache();

        expect(saveStateMock).toHaveBeenCalledWith(CacheState.ShouldWrite, "false");
    });

    it("records a read-only state when the default branch cannot be determined", async () => {
        context.payload = {};
        context.ref = "refs/heads/main";
        restoreCacheMock.mockResolvedValue(undefined);

        await cache.restoreCache();

        expect(saveStateMock).toHaveBeenCalledWith(CacheState.ShouldWrite, "false");
    });

    it("records the matched key when the cache is restored", async () => {
        restoreCacheMock.mockResolvedValue("matlab-buildtool-Linux-build-hash-old");

        await cache.restoreCache();

        expect(saveStateMock).toHaveBeenCalledWith(
            CacheState.MatchedKey,
            "matlab-buildtool-Linux-build-hash-old",
        );
        expect(infoMock).toHaveBeenCalledWith(
            expect.stringContaining("matlab-buildtool-Linux-build-hash-old"),
        );
    });

    it("does not record a matched key when there is no cache hit", async () => {
        restoreCacheMock.mockResolvedValue(undefined);

        await cache.restoreCache();

        expect(saveStateMock).not.toHaveBeenCalledWith(CacheState.MatchedKey, expect.anything());
    });

    it("warns and returns without recording a matched key when restore fails", async () => {
        restoreCacheMock.mockRejectedValue(new Error("network down"));

        await expect(cache.restoreCache()).resolves.toBeUndefined();

        expect(warningMock).toHaveBeenCalledWith(expect.stringContaining("network down"));
        expect(saveStateMock).not.toHaveBeenCalledWith(CacheState.MatchedKey, expect.anything());
    });
});

describe("cache save", () => {
    beforeEach(() => {
        // Assume the .buildtool directory exists unless a test says otherwise
        existsSyncMock.mockReturnValue(true);
    });

    // Helper to set the mock state
    function setState(state: { primaryKey?: string; matchedKey?: string; shouldWrite?: string }) {
        if (state.primaryKey !== undefined) {
            process.env[`STATE_${CacheState.PrimaryKey}`] = state.primaryKey;
        }
        if (state.matchedKey !== undefined) {
            process.env[`STATE_${CacheState.MatchedKey}`] = state.matchedKey;
        }
        if (state.shouldWrite !== undefined) {
            process.env[`STATE_${CacheState.ShouldWrite}`] = state.shouldWrite;
        }
    }

    it("saves on the default branch", async () => {
        setState({ primaryKey: "matlab-buildtool-Linux-abc", shouldWrite: "true" });

        await cache.saveCache();

        expect(existsSyncMock).toHaveBeenCalledWith(".buildtool");
        expect(saveCacheMock).toHaveBeenCalledWith([".buildtool"], "matlab-buildtool-Linux-abc");
        expect(infoMock).toHaveBeenCalledWith(
            expect.stringContaining("matlab-buildtool-Linux-abc"),
        );
    });

    it("saves after a restore-key hit that is not the primary key", async () => {
        setState({
            primaryKey: "matlab-buildtool-Linux-abc",
            matchedKey: "matlab-buildtool-Linux-old",
            shouldWrite: "true",
        });

        await cache.saveCache();

        expect(saveCacheMock).toHaveBeenCalledWith([".buildtool"], "matlab-buildtool-Linux-abc");
    });

    it("does not save when caching is disabled", async () => {
        // Caching disabled means restoreCache never ran, so no state was
        // recorded and getState returns an empty string for every key.
        setState({ primaryKey: "", matchedKey: "", shouldWrite: "" });

        await cache.saveCache();

        expect(saveCacheMock).not.toHaveBeenCalled();
        expect(debugMock).toHaveBeenCalledWith(expect.stringContaining("Caching is disabled"));
    });

    it("does not save on a non-default branch", async () => {
        // On non-default branches CacheState.ShouldWrite is set to false in cache.restoreCache
        setState({ primaryKey: "matlab-buildtool-Linux-abc", shouldWrite: "false" });

        await cache.saveCache();

        expect(saveCacheMock).not.toHaveBeenCalled();
        expect(debugMock).toHaveBeenCalledWith(expect.stringContaining("read-only"));
    });

    it("does not save when the primary key was already an exact hit", async () => {
        setState({
            primaryKey: "matlab-buildtool-Linux-abc",
            matchedKey: "matlab-buildtool-Linux-abc",
            shouldWrite: "true",
        });

        await cache.saveCache();

        expect(saveCacheMock).not.toHaveBeenCalled();
        expect(debugMock).toHaveBeenCalledWith(expect.stringContaining("Cache hit occurred"));
    });

    it("warns and does not save when there is no build directory", async () => {
        existsSyncMock.mockReturnValue(false);
        setState({ primaryKey: "matlab-buildtool-Linux-abc", shouldWrite: "true" });

        await cache.saveCache();

        expect(saveCacheMock).not.toHaveBeenCalled();
        expect(warningMock).toHaveBeenCalledWith(expect.stringContaining(".buildtool"));
    });

    it("warns and swallows a save failure without throwing", async () => {
        setState({ primaryKey: "matlab-buildtool-Linux-abc", shouldWrite: "true" });
        saveCacheMock.mockRejectedValue(new Error("cache service unavailable"));

        await expect(cache.saveCache()).resolves.toBeUndefined();

        expect(warningMock).toHaveBeenCalledWith(
            expect.stringContaining("cache service unavailable"),
        );
    });
});
