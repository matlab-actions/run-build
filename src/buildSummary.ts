// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
import { join } from 'path';
import { readFileSync } from 'fs';

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

  tasks.forEach((task, index) => {
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

export function processAndDisplayBuildSummary() {
  const runId = process.env.GITHUB_RUN_ID;
  const runnerTemp = process.env.RUNNER_TEMP;
  let filePath: string;

  if (!runId) {
    filePath = join(runnerTemp as string, `buildSummary.json`);
  } else {
    filePath = join(runnerTemp as string, `buildSummary_${runId as string}.json`);
  }

  const data = JSON.parse(readFileSync(filePath, { encoding: 'utf8' }));
  const taskSummaryTableRows = getBuildSummaryTable(data);
  writeSummary(taskSummaryTableRows);
}

