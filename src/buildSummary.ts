// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
import { join } from 'path';
import { readFileSync, unlinkSync, accessSync} from 'fs';

export interface Task {
    name: string;
    description: string;
    failed: boolean;
    skipped: boolean;
    duration: string;
}


export function getBuildSummaryTable(tasks: Task[]): string[][] {
    const header: string[] = ['MATLAB Build Task', 'Status', 'Description', 'Duration (HH:MM:SS)'];
    let taskSummaryTableRows: string[][] = [header];

    if(!Array.isArray(tasks)){  
        taskSummaryTableRows = getTaskSummaryRows(tasks, taskSummaryTableRows);     
    } else {
        tasks.forEach((task, index) => {
            taskSummaryTableRows = getTaskSummaryRows(task, taskSummaryTableRows);      
        });
    }

    return taskSummaryTableRows;
}

export function writeSummary(taskSummaryTableRows: string[][]) {
    try {
        core.summary
            .addTable(taskSummaryTableRows)
            .write();
    } catch (e) {
        console.error('An error occurred while adding the build results table to the summary:', e);
    }
}

export function processAndDisplayBuildSummary() {
    const runId = process.env.GITHUB_RUN_ID || '';
    const runnerTemp = process.env.RUNNER_TEMP || '';

    const filePath: string = join(runnerTemp, `buildSummary${runId}.json`);
    let taskSummaryTableRows;
    if (!checkFileExistsSync(filePath)) {
        try {
            const data = JSON.parse(readFileSync(filePath, { encoding: 'utf8' }));
            taskSummaryTableRows = getBuildSummaryTable(data);
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
        writeSummary(taskSummaryTableRows);
    } 
}

export function getTaskDetails(tasks: Task): string[] {
    let taskDetails: string[] = [];
    taskDetails.push(tasks.name);
    if (tasks.failed) {
        taskDetails.push('🔴 FAILED');
    } else if (tasks.skipped) {
        taskDetails.push('🔵 SKIPPED');
    } else {
        taskDetails.push('🟢 SUCCESS');
    }
    taskDetails.push(tasks.description);
    taskDetails.push(tasks.duration);
    return taskDetails;
}

export function getTaskSummaryRows(task: Task, taskSummaryTableRows: string[][]): string[][] {
    let taskDetails: string[] = [];
    taskDetails = getTaskDetails(task);
    taskSummaryTableRows.push(taskDetails);
    return taskSummaryTableRows;
}

function checkFileExistsSync(filePath: string): boolean {
    try {
        accessSync(filePath);
        return true; 
    } catch (err) {
        return false; 
    }
}
