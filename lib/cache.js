// Copyright 2026 The MathWorks, Inc.
import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { context } from "@actions/github";
import * as crypto from "crypto";
import * as fs from "fs";
import { CacheState } from "./cache-state.js";
const CACHE_PATH = ".buildtool";
const DEFAULT_KEY_PREFIX = "matlab-buildtool";
export function getCacheKey() {
    const os = process.env.RUNNER_OS || process.platform;
    const job = process.env.GITHUB_JOB || "";
    const sha = process.env.GITHUB_SHA || "";
    // Distinguish jobs of a matrix build and hash them so the key is
    // short and free of characters that shouldn't be in cache keys.
    const jobMatrixJson = core.getInput("job-matrix-json");
    const matrixHash = crypto.createHash("sha256").update(jobMatrixJson).digest("hex").slice(0, 16);
    const base = `${DEFAULT_KEY_PREFIX}-${os}-${job}-${matrixHash}`;
    return {
        primaryKey: `${base}-${sha}`,
        restoreKeys: [`${base}-`],
    };
}
function isDefaultBranch() {
    const defaultBranch = context.payload.repository?.default_branch || false;
    return defaultBranch && context.ref === `refs/heads/${defaultBranch}`;
}
export async function saveCache() {
    const primaryKey = core.getState(CacheState.PrimaryKey);
    if (!primaryKey) {
        // primaryKey is absent because caching was disabled
        core.debug("Caching is disabled, not saving cache.");
        return;
    }
    if (core.getState(CacheState.ShouldWrite) !== "true") {
        core.debug("Cache is read-only on this branch, not saving cache.");
        return;
    }
    if (core.getState(CacheState.MatchedKey) === primaryKey) {
        core.debug(`Cache hit occurred for key: ${primaryKey}, not saving cache.`);
        return;
    }
    if (!fs.existsSync(CACHE_PATH)) {
        core.warning(`'${CACHE_PATH}' directory not found, not saving cache.`);
        return;
    }
    try {
        await cache.saveCache([CACHE_PATH], primaryKey);
        core.info(`Cache saved with key: ${primaryKey}`);
    }
    catch (e) {
        core.warning(`Failed to save the cache: ${e}`);
    }
}
export async function restoreCache() {
    if (!cache.isFeatureAvailable()) {
        core.debug("Cache service is not available, not using the cache.");
        return;
    }
    const { primaryKey, restoreKeys } = getCacheKey();
    core.saveState(CacheState.PrimaryKey, primaryKey);
    core.saveState(CacheState.ShouldWrite, String(isDefaultBranch()));
    let matchedKey;
    try {
        matchedKey = await cache.restoreCache([CACHE_PATH], primaryKey, restoreKeys);
    }
    catch (e) {
        core.warning(`Failed to restore the cache: ${e}`);
        return;
    }
    if (matchedKey) {
        core.saveState(CacheState.MatchedKey, matchedKey);
        core.info(`Cache restored from key: ${matchedKey}`);
    }
    else {
        core.info(`Cache not found for key: ${primaryKey}`);
    }
}
//# sourceMappingURL=cache.js.map