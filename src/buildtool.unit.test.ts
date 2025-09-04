// Copyright 2022-2024 The MathWorks, Inc.

import * as path from "path";
import * as buildtool from "./buildtool";

describe("command generation", () => {
const command = "addpath('"+ path.join(__dirname, "plugins").replaceAll("'","''") +"'); buildtool"
    it("buildtool invocation with unspecified tasks and build options", () => {
        const options: buildtool.RunBuildOptions = {
            Tasks: "",
            BuildOptions: "",
        };

        const actual = buildtool.generateCommand(options);
        expect(actual).toBe(command)
    });

    it("buildtool invocation with tasks specified", () => {
        const options: buildtool.RunBuildOptions = {
            Tasks: "compile test",
        };

        const actual = buildtool.generateCommand(options);
        expect(actual).toBe(command + " compile test")
    });

    it("buildtool invocation with only build options", () => {
        const options: buildtool.RunBuildOptions = {
            Tasks: "",
            BuildOptions: "-continueOnFailure -skip check",
        };

        const actual = buildtool.generateCommand(options);
        expect(actual).toBe(command + " -continueOnFailure -skip check")
    });

    it("buildtool invocation with specified tasks and build options", () => {
        const options: buildtool.RunBuildOptions = {
            Tasks: "compile test",
            BuildOptions: "-continueOnFailure -skip check",
        };

        const actual = buildtool.generateCommand(options);
        expect(actual).toBe(command + " compile test -continueOnFailure -skip check")
    });
});
