// Copyright 2024 The MathWorks, Inc.
import * as core from "@actions/core";
import { readFile } from 'fs';
import { promisify } from 'util';

// Promisify the readFile function to use it with async/await
const readFileAsync = promisify(readFile);

interface TaskDetails {
  name: string;
  description: string;
  failed: boolean;
  skipped: boolean;
  duration: string;
}

async function readJsonFile(filePath: string): Promise<TaskDetails[]> {
  try {
    const data = await readFileAsync(filePath, { encoding: 'utf8' });
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading the JSON file:', error);
    return [];
  }
}

function addBuildSummaryTable(data: TaskDetails[]): void {
  core.summary
  .addHeading('MATLAB Build Results')
  .addTable([
    [{data: 'Task Name', header: true}, {data: 'Status', header: true}, {data: 'Description', header: true}, {data: 'Duration (HH:MM:SS)', header: true}],
      if (data.length > 0) {
      let values: string[] = [];
        data.forEach((row) => {
          Object.values(row).forEach((value) => {
            values.push(${value})
          });
        });
        values + ","
      }
  ])
}
