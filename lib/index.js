"use strict";
// Copyright 2022-2024 The MathWorks, Inc.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const run_matlab_command_action_1 = require("run-matlab-command-action");
const buildtool = __importStar(require("./buildtool"));
const buildSummary = __importStar(require("./buildSummary"));
/**
 * Gather action inputs and then run action.
 */
async function run() {
    const platform = process.platform;
    const architecture = process.arch;
    const workspaceDir = process.cwd();
    const options = {
        Tasks: core.getInput("tasks"),
        BuildOptions: core.getInput("build-options"),
    };
    const command = buildtool.generateCommand(options);
    const startupOptions = core.getInput("startup-options").split(" ");
    const helperScript = await run_matlab_command_action_1.matlab.generateScript(workspaceDir, command);
    const execOptions = {
        env: {
            ...process.env,
            "MW_MATLAB_BUILDTOOL_DEFAULT_PLUGINS_FCN_OVERRIDE": "ciplugins.github.getDefaultPlugins",
        }
    };
    await run_matlab_command_action_1.matlab.runCommand(helperScript, platform, architecture, (cmd, args) => exec.exec(cmd, args, execOptions), startupOptions).finally(() => {
        buildSummary.processAndDisplayBuildSummary();
    });
}
run().catch(e => {
    core.setFailed(e);
});
//# sourceMappingURL=index.js.map