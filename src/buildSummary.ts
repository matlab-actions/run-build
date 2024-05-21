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

export async function readJsonFile(filePath: string): Promise<TaskList[]> {
  try {
    const data = await readFileAsync(filePath, { encoding: 'utf8' });
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading the JSON file:', error);
    return [];
  }
}

export function addBuildSummaryTable(task: TaskList[]): void {
console.log("Task Details:");
tasksData.taskDetails.forEach((task, index) => {
  console.log(`Task ${index + 1}:`);
  console.log(`Name: ${task.name}`);
  console.log(`Description: ${task.description}`);
  console.log(`Failed: ${task.failed}`);
  console.log(`Skipped: ${task.skipped}`);
  console.log(`Duration: ${task.duration}`);
  console.log('---');
});
  let fruits: string[] = ["Apple", "Banana", "Orange", "banana"];
  core.summary
  .addHeading('MATLAB Build Results')
  .addTable([
    [{data: 'Task Name', header: true}, {data: 'Status', header: true}, {data: 'Description', header: true}, {data: 'Duration (HH:MM:SS)', header: true}],
    fruits,
    fruits
  ])
  .write()
}
