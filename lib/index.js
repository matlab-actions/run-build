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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const run_matlab_command_action_1 = require("run-matlab-command-action");
const buildtool = __importStar(require("./buildtool"));
/**
 * Gather action inputs and then run action.
 */
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const platform = process.platform;
        const architecture = process.arch;
        const workspaceDir = process.cwd();
        const options = {
            Tasks: core.getInput("tasks"),
            BuildOptions: core.getInput("build-options"),
        };
        const command = buildtool.generateCommand(options);
        const startupOptions = core.getInput("startup-options").split(" ");
        const helperScript = yield core.group("Generate script", () => __awaiter(this, void 0, void 0, function* () {
            const helperScript = yield run_matlab_command_action_1.matlab.generateScript(workspaceDir, command);
            core.info("Successfully generated script");
            return helperScript;
        }));
        yield core.group("Run command", () => __awaiter(this, void 0, void 0, function* () {
            yield run_matlab_command_action_1.matlab.runCommand(helperScript, platform, architecture, exec.exec, startupOptions);
        }));
    });
}
run().catch((e) => {
    core.setFailed(e);
});
//# sourceMappingURL=index.js.map