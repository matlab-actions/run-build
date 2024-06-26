// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
import { join } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

// Promisify the readFile function to use it with async/await
const readFileAsync = promisify(readFile);

export interface Task {
  name: string;
  description: string;
  failed: boolean;
  skipped: boolean;
  duration: string;
}

export interface TaskList {
  taskDetails: Task[];
}

export async function readJsonFile(filePath: string): Promise<TaskList> {
  try {
    const data = await readFileAsync(filePath, { encoding: 'utf8' });
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading the buildSummary file:', error);
    throw error;
  }
}

export function getBuildSummaryTable(tasks: TaskList): string[][] {
  const header: string[] = ['MATLAB Build Task', 'Status', 'Description', 'Duration (HH:MM:SS)'];
  let taskSummaryTableRows: string[][] = [header];

  tasks.taskDetails.forEach((task, index) => {
    let taskDetails: string[] = [];
    taskDetails.push(task.name);
    if (task.failed) {
      taskDetails.push('🔴 FAILED');
    } else if (task.skipped) {
      taskDetails.push('🔵 SKIPPED');
    } else {
      taskDetails.push('🟢 SUCCESS');
    }
    taskDetails.push(task.description);
    taskDetails.push(task.duration);

    taskSummaryTableRows.push(taskDetails);
  });

  return taskSummaryTableRows;
}

export function writeSummary(taskSummaryTableRows: string[][]) {
    core.summary
      .addTable(taskSummaryTableRows)
      .write();
}

export async function processAndDisplayBuildSummary() {
  const runId = process.env.GITHUB_RUN_ID;
  const runnerTemp = process.env.RUNNER_TEMP;
  let filePath: string;

  try {

    if (!runId) {
      filePath = join(runnerTemp as string, `buildSummary_.json`);
    } else {
      filePath = join(runnerTemp as string, `buildSummary_${runId as string}.json`);
    }

    const data = await readJsonFile(filePath);
    const taskSummaryTableRows = getBuildSummaryTable(data);
    writeSummary(taskSummaryTableRows);
  } catch (error) {
    console.error('An error occurred while reading the build summary file or adding the build summary table:', error);
  }
}

