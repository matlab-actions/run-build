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
exports.getTaskSummaryRows = exports.getTaskDetails = exports.processAndDisplayBuildSummary = exports.writeSummary = exports.getBuildSummaryTable = void 0;
// Copyright 2024 The MathWorks, Inc.
const core = __importStar(require("@actions/core"));
const path_1 = require("path");
const fs_1 = require("fs");
function getBuildSummaryTable(tasks) {
    const header = ['MATLAB Build Task', 'Status', 'Description', 'Duration (HH:MM:SS)'];
    let taskSummaryTableRows = [header];
    if (!Array.isArray(tasks)) {
        taskSummaryTableRows = getTaskSummaryRows(tasks, taskSummaryTableRows);
    }
    else {
        tasks.forEach((task, index) => {
            taskSummaryTableRows = getTaskSummaryRows(task, taskSummaryTableRows);
        });
    }
    return taskSummaryTableRows;
}
exports.getBuildSummaryTable = getBuildSummaryTable;
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
function processAndDisplayBuildSummary() {
    const runId = process.env.GITHUB_RUN_ID || '';
    const runnerTemp = process.env.RUNNER_TEMP || '';
    const filePath = (0, path_1.join)(runnerTemp, `buildSummary${runId}.json`);
    let taskSummaryTableRows;
    try {
        const data = JSON.parse((0, fs_1.readFileSync)(filePath, { encoding: 'utf8' }));
        taskSummaryTableRows = getBuildSummaryTable(data);
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
    writeSummary(taskSummaryTableRows);
}
exports.processAndDisplayBuildSummary = processAndDisplayBuildSummary;
function getTaskDetails(tasks) {
    let taskDetails = [];
    taskDetails.push(tasks.name);
    if (tasks.failed) {
        taskDetails.push('🔴 FAILED');
    }
    else if (tasks.skipped) {
        taskDetails.push('🔵 SKIPPED');
    }
    else {
        taskDetails.push('🟢 SUCCESS');
    }
    taskDetails.push(tasks.description);
    taskDetails.push(tasks.duration);
    return taskDetails;
}
exports.getTaskDetails = getTaskDetails;
function getTaskSummaryRows(task, taskSummaryTableRows) {
    let taskDetails = [];
    taskDetails = getTaskDetails(task);
    taskSummaryTableRows.push(taskDetails);
    return taskSummaryTableRows;
}
exports.getTaskSummaryRows = getTaskSummaryRows;
//# sourceMappingURL=buildSummary.js.map