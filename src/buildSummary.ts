// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
import { join } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

// Promisify the readFile function to use it with async/await
const readFileAsync = promisify(readFile);

interface Task {
  name: string;
  description: string;
  failed: boolean;
  skipped: boolean;
  duration: string;
}

interface TaskList {
  taskDetails: Task[];
}

export async function readJsonFile(filePath: string): Promise<TaskList> {
  try {
    const data = await readFileAsync(filePath, { encoding: 'utf8' });
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading the JSON file:', error);
    throw error;
  }
}

export function getBuildSummaryTable(tasks: TaskList): string[][] {
  const header: string[] = ['Task Name', 'Status', 'Description', 'Duration (HH:MM:SS)'];
  let taskSummaryTableRows: string[][] = [header];

  tasks.taskDetails.forEach((task, index) => {
    let taskDetails: string[] = [];
    taskDetails.push(task.name);
    if (task.failed) {
      taskDetails.push('🔴 FAILED');
    } else if (task.skipped) {
      taskDetails.push('🔵 SKIPPED');
    } else {
      taskDetails.push('🟢 PASSED');
    }
    taskDetails.push(task.description);
    taskDetails.push(task.duration);

    taskSummaryTableRows.push(taskDetails);
  });

  return taskSummaryTableRows;
}

export function writeSummary(taskSummaryTableRows: string[][]) {
    core.summary
      .addHeading('MATLAB Build Results')
      .addTable(taskSummaryTableRows)
      .write();
}

export async function processAndDisplayBuildSummary() {
  const runId = process.env.GITHUB_RUN_ID;

  if (!runId) {
    console.error('GITHUB_RUN_ID environment variable is not set. Unable to locate the build summary file.');
    return;
  }

  try {
    const runnerTemp = process.env.RUNNER_TEMP;
    const filePath = join(runnerTemp, `buildSummary_${runId}.json`);
    const data = await readJsonFile(filePath);
    const taskSummaryTableRows = getBuildSummaryTable(data);
    writeSummary(taskSummaryTableRows);
  } catch (error) {
    console.error('An error occurred while reading the build summary file or adding the build summary table:', error);
  }
}

