// Copyright 2022 The MathWorks, Inc.

import * as buildtool from "./buildtool";

describe("command generation", () => {
    it("buildtool invocation with unspecified options", () => {
        const options: buildtool.RunBuildOptions = {
            Tasks: "",
        };

        const actual = buildtool.generateCommand(options);
        expect(actual).toBe("buildtool")
    });

    it("buildtool invocation with tasks specified", () => {
        const options: buildtool.RunBuildOptions = {
            Tasks: "compile test",
        };

        const actual = buildtool.generateCommand(options);
        expect(actual).toBe("buildtool compile test")

    });
});
