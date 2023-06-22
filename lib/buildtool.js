"use strict";
// Copyright 2022 The MathWorks, Inc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommand = void 0;
function generateCommand(options) {
    let command = "buildtool";
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    return command;
}
exports.generateCommand = generateCommand;
//# sourceMappingURL=buildtool.js.map