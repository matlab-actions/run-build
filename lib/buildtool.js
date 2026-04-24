// Copyright 2022-2025 The MathWorks, Inc.
export function generateCommand(options) {
    let command = "buildtool";
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    if (options.BuildOptions) {
        command = command + " " + options.BuildOptions;
    }
    return command;
}
//# sourceMappingURL=buildtool.js.map