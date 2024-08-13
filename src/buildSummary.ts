// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
import { join } from 'path';
import { readFileSync, unlinkSync, existsSync} from 'fs';

export interface Task {
    name: string;
    description: string;
    failed: boolean;
    skipped: boolean;
    duration: string;
}


export function getBuildSummaryTable(tasks: Task[]): string[][] {
    const header = [{data:'MATLAB Build Task', header: true}, {data: 'Status', header: true}, {data:'Description', header:true}, {data: 'Duration (hh:mm:ss)', header: true }];
    let taskSummaryTableRows: string[][] = [];


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
    const header = [{data:'MATLAB Build Task', header: true}, {data: 'Status', header: true}, {data:'Description', header:true}, {data: 'Duration (hh:mm:ss)', header: true }];

    const filePath: string = join(runnerTemp, `buildSummary${runId}.json`);
    let taskSummaryTableRows;
    if (existsSync(filePath)) {
        try {
            const bs = readFileSync(filePath, { encoding: 'utf8' });
            const data = JSON.parse(bs).map((t: { name: any; failed: { toString: () => any; }; skipped: { toString: () => any; }; description: any; duration: { toString: () => any; }; }) => {
                if (t.failed.toString() === 'true') {
                    return [t.name, '🔴 Failed', t.description, t.duration.toString()];
                } else if (t.skipped.toString() === 'true') {
                    return [t.name, '🔵 Skipped', t.description, t.duration.toString()];
                } else {
                    return [t.name, '🟢 Success', t.description, t.duration.toString()];
                }
            });
            taskSummaryTableRows = [header, ...data];//getBuildSummaryTable(data);
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
    } else {
        core.info(`Build summary data not created.`);
    }
    
}

export function getTaskDetails(tasks: Task): string[] {
    let taskDetails: string[] = [];
    taskDetails.push(tasks.name);
    if (tasks.failed) {
        taskDetails.push('🔴 Failed');
    } else if (tasks.skipped) {
        taskDetails.push('🔵 Skipped');
    } else {
        taskDetails.push('🟢 Success');
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
