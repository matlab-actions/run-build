// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
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

export function addBuildSummaryTable(tasks: TaskList): void {
const header: string[] = ['Task Name', 'Status', 'Description', 'Duration (HH:MM:SS)'];
console.log("Task Details:");
let arrayOfStringArrays: string[][] = [];
arrayOfStringArrays.push(header);
tasks.taskDetails.forEach((task, index) => {
  let taskDetails: string[] = [];
  console.log(`Task ${index + 1}:`);
  taskDetails.push(`${task.name}`);
  if (`${task.failed}` === 'true') {
    taskDetails.push('FAILED');
  } else if (`${task.skipped}` === 'true') {
    taskDetails.push('SKIPPED');
  } else {
    taskDetails.push('PASSED');
  }
  taskDetails.push(`${task.description}`)
  taskDetails.push(`${task.duration}`);

  arrayOfStringArrays.push(taskDetails);
});

  core.summary
  .addHeading('MATLAB Build Results')
  .addTable(arrayOfStringArrays)
  .write()
}
