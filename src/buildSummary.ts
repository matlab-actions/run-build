// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
import { join } from 'path';
import { readFileSync, unlinkSync, existsSync } from 'fs';

// export interface Task {
//     name: string;
//     description: string;
//     failed: boolean;
//     skipped: boolean;
//     skipReason: string;
//     duration: string;
// }

export function writeSummary(taskSummaryTableRows: string[][]) {
    try {
        core.summary
            .addTable(taskSummaryTableRows)
            .write();
    } catch (e) {
        console.error('An error occurred while adding the build results table to the summary:', e);
    }
}

export function getSummaryRows(buildSummary: string): any[] {
    const rows = JSON.parse(buildSummary).map((t: any) => {
        if (t.failed) {
            return [t.name, '🔴 Failed', t.description, t.duration.toString()];
        } else if (t.skipped) {
            return [t.name, '🔵 Skipped' + ' (' + interpretSkipReason(t.skipReason) + ')', t.description, t.duration.toString()];
        } else {
            return [t.name, '🟢 Success', t.description, t.duration.toString()];
        }
    });
    return rows;
}

export function interpretSkipReason(skipReason: string){
    switch(skipReason) {
        case "UpToDate":
            return "Up-To-Date";
        case "UserSpecified":
            return "User Specified";
        case "DependencyFailed":
            return "Dependency Failed";
        default:
            return skipReason;
    }
}

export function processAndDisplayBuildSummary() {
    const runId = process.env.GITHUB_RUN_ID || '';
    const runnerTemp = process.env.RUNNER_TEMP || '';
    const header = [{ data: 'MATLAB Build Task', header: true }, { data: 'Status', header: true }, { data: 'Description', header: true }, { data: 'Duration (hh:mm:ss)', header: true }];

    const filePath: string = join(runnerTemp, `buildSummary${runId}.json`);
    let taskSummaryTable;
    if (existsSync(filePath)) {
        try {
            const buildSummary = readFileSync(filePath, { encoding: 'utf8' });
            const rows = getSummaryRows(buildSummary);
            taskSummaryTable = [header, ...rows];
        } catch (e) {
            console.error('An error occurred while reading the build summary file:', e);
            return;
        } finally {
            try {
                unlinkSync(filePath);
            } catch (e) {
                console.error(`An error occurred while trying to delete the build summary file ${filePath}:`, e);
            }
        }
        writeSummary(taskSummaryTable);
    } else {
        core.info(`Build summary data not created.`);
    }
}
