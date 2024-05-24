// Copyright 2024 The MathWorks, Inc.

import * as buildSummary from './buildSummary';
import * as fs from 'fs/promises';
import * as core from '@actions/core';


jest.mock('@actions/core', () => ({
  summary: {
    addHeading: jest.fn().mockReturnThis(),
    addTable: jest.fn().mockReturnThis(),
    write: jest.fn().mockReturnThis(),
  },
}));

describe('summaryGeneration', () => {
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

jest.mock('fs/promises');

describe('readJsonFile', () => {
  const mockReadFileAsync = fs.readFile as jest.MockedFunction<typeof fs.readFile>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reads and parses JSON file successfully', async () => {
    const mockData: TaskList = {
      taskDetails: [
        {
          name: 'Task 1',
          description: 'Description 1',
          failed: false,
          skipped: false,
          duration: '00:00:10',
        },
      ],
    };

    mockReadFileAsync.mockResolvedValue(JSON.stringify(mockData));

    const filePath = 'path/to/mockFile.json';
    const result = await buildSummary.readJsonFile(filePath as string);

    expect(mockReadFileAsync).toHaveBeenCalledWith(filePath, { encoding: 'utf8' });
    expect(result).toEqual(mockData);
  });

  it('throws an error if the file cannot be read', async () => {
    mockReadFileAsync.mockRejectedValue(new Error('File not found'));

    const filePath = 'path/to/nonExistentFile.json';

    await expect(buildSummary.readJsonFile(filePath as string)).rejects.toThrow('File not found');
  });

  it('throws an error if the file contains invalid JSON', async () => {
    mockReadFileAsync.mockResolvedValue('invalid JSON');

    const filePath = 'path/to/invalidJsonFile.json';

    await expect(buildSummary.readJsonFile(filePath as string)).rejects.toThrow(SyntaxError);
  });
});