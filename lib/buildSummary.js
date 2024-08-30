"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAndDisplayBuildSummary = exports.interpretSkipReason = exports.getSummaryRows = exports.writeSummary = void 0;
// Copyright 2024 The MathWorks, Inc.
const core = __importStar(require("@actions/core"));
const path_1 = require("path");
const fs_1 = require("fs");
function writeSummary(taskSummaryTableRows) {
    try {
        core.summary
            .addTable(taskSummaryTableRows)
            .write();
    }
    catch (e) {
        console.error('An error occurred while adding the build results table to the summary:', e);
    }
}
exports.writeSummary = writeSummary;
function getSummaryRows(buildSummary) {
    const rows = JSON.parse(buildSummary).map((t) => {
        if (t.failed) {
            return [t.name, '🔴 Failed', t.description, t.duration];
        }
        else if (t.skipped) {
            return [t.name, '🔵 Skipped' + ' (' + interpretSkipReason(t.skipReason) + ')', t.description, t.duration];
        }
        else {
            return [t.name, '🟢 Succeeded', t.description, t.duration];
        }
    });
    return rows;
}
exports.getSummaryRows = getSummaryRows;
function interpretSkipReason(skipReason) {
    switch (skipReason) {
        case "UpToDate":
            return "up-to-date";
        case "UserSpecified":
        case "UserRequested":
            return "user requested";
        case "DependencyFailed":
            return "dependency failed";
        default:
            return skipReason;
    }
}
exports.interpretSkipReason = interpretSkipReason;
function processAndDisplayBuildSummary() {
    const runId = process.env.GITHUB_RUN_ID || '';
    const runnerTemp = process.env.RUNNER_TEMP || '';
    const header = [{ data: 'MATLAB Task', header: true }, { data: 'Status', header: true }, { data: 'Description', header: true }, { data: 'Duration (HH:mm:ss)', header: true }];
    const filePath = (0, path_1.join)(runnerTemp, `buildSummary${runId}.json`);
    let taskSummaryTable;
    if ((0, fs_1.existsSync)(filePath)) {
        try {
            const buildSummary = (0, fs_1.readFileSync)(filePath, { encoding: 'utf8' });
            const rows = getSummaryRows(buildSummary);
            taskSummaryTable = [header, ...rows];
        }
        catch (e) {
            console.error('An error occurred while reading the build summary file:', e);
            return;
        }
        finally {
            try {
                (0, fs_1.unlinkSync)(filePath);
            }
            catch (e) {
                console.error(`An error occurred while trying to delete the build summary file ${filePath}:`, e);
            }
        }
        writeSummary(taskSummaryTable);
    }
    else {
        core.info(`Build summary data not created.`);
    }
}
exports.processAndDisplayBuildSummary = processAndDisplayBuildSummary;
//# sourceMappingURL=buildSummary.js.map