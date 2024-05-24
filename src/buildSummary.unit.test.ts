// Copyright 2024 The MathWorks, Inc.

import * as buildSummary from './buildSummary';
import * as core from '@actions/core';
import { readFile } from 'fs';

jest.mock('fs', () => ({
 readFile: jest.fn((path: string, options: { encoding: string; flag?: string }, callback: (err: NodeJS.ErrnoException | null, data: string) => void) => {
  }),
}));

jest.mock('@actions/core', () => ({
  summary: {
    addHeading: jest.fn().mockReturnThis(),
    addTable: jest.fn().mockReturnThis(),
    write: jest.fn().mockReturnThis(),
  },
}));

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('readJsonFile', () => {
  it('reads and parses a JSON file successfully', async () => {
    const mockData = JSON.stringify({
      taskDetails: [
        { name: 'Test Task', description: 'A test task', failed: false, skipped: false, duration: '00:00:10' },
      ],
    });
    mockReadFile.mockImplementation((path: string, options: { encoding: string; flag?: string } | string, callback: (err: NodeJS.ErrnoException | null, data: string) => void) => {
      callback(null, mockData);
    });

    const filePath = 'path/to/mockFile.json';
    const data = await buildSummary.readJsonFile(filePath as string);

    expect(data).toEqual(JSON.parse(mockData));
    expect(mockReadFile).toHaveBeenCalledWith(filePath, { encoding: 'utf8' }, expect.any(Function));
  });

  it('throws an error if the file cannot be read', async () => {
    mockReadFile.mockImplementation((path: string, options: { encoding: string; flag?: string } | string, callback: (err: NodeJS.ErrnoException | null, data: string) => void) => {
      callback(new Error('File not found'), null);
    });

    const filePath = 'path/to/nonExistentFile.json';
    await expect(buildSummary.readJsonFile(filePath as string)).rejects.toThrow('File not found');
  });

  it('generates a summary table correctly', () => {
      const mockTasks = {
        taskDetails: [
          { name: 'Test Task', description: 'A test task', failed: true, skipped: false, duration: '00:00:10' },
        ],
      };

      const expectedTable = [
        ['Task Name', 'Status', 'Description', 'Duration (HH:MM:SS)'],
        ['Test Task', '🔴 FAILED', 'A test task', '00:00:10'],
      ];

      const table = buildSummary.getBuildSummaryTable(mockTasks);

      expect(table).toEqual(expectedTable);
  });

  it('writes the summary correctly', () => {
      const mockTableRows = [
        ['Task Name', 'Status', 'Description', 'Duration (HH:MM:SS)'],
        ['Test Task', '🔴 FAILED', 'A test task', '00:00:10'],
      ];

      buildSummary.writeSummary(mockTableRows);

      expect(core.summary.addHeading).toHaveBeenCalledTimes(1);
      expect(core.summary.addHeading).toHaveBeenCalledWith('MATLAB Build Results');

      expect(core.summary.addTable).toHaveBeenCalledTimes(1);
      expect(core.summary.addTable).toHaveBeenCalledWith(mockTableRows);
  });
});