"use strict";
// Copyright 2022-2025 The MathWorks, Inc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommand = generateCommand;
function generateCommand(options) {
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