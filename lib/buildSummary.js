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
exports.writeSummary = writeSummary;
exports.getSummaryRows = getSummaryRows;
exports.interpretSkipReason = interpretSkipReason;
exports.processAndDisplayBuildSummary = processAndDisplayBuildSummary;
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
//# sourceMappingURL=buildSummary.js.map