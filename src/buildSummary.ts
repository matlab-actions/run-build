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
console.log("Task Details:");
let arrayOfStringArrays: string[][] = [];
tasks.taskDetails.forEach((task, index) => {
  let taskDetails: string[] = [];
  console.log(`Task ${index + 1}:`);
  taskDetails.push(`${task.name}`);
  console.log(`Name: ${task.name}`);
  taskDetails.push(`${task.description}`)
  console.log(`Description: ${task.description}`);
  taskDetails.push(`${task.failed}`);
  console.log(`Failed: ${task.failed}`);
  taskDetails.push(`${task.skipped}`);
  console.log(`Skipped: ${task.skipped}`);
  taskDetails.push(`${task.duration}`);
  console.log(`Duration: ${task.duration}`);
  console.log('---');
  arrayOfStringArrays.push(taskDetails);
});



  core.summary
  .addHeading('MATLAB Build Results')
  .addTable([
    [{data: 'Task Name', header: true}, {data: 'Status', header: true}, {data: 'Description', header: true},{data: 'Duration (HH:MM:SS)', header: true}],
    ["",""]
   ])
  .write()
}
