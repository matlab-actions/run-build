// Copyright 2024 The MathWorks, Inc.

import * as buildSummary from './buildSummary';
import * as core from '@actions/core';
import { readFile } from 'fs';
import * as fs from 'fs';

jest.mock('fs', () => ({
  readFile: jest.fn(
    (
      path: fs.PathOrFileDescriptor,
      options: { encoding: fs.BufferEncoding; flag?: string; } | fs.BufferEncoding,
      callback: (err: NodeJS.ErrnoException | null, data: string) => void
    ) => {

    }
  ),
}));

jest.mock('@actions/core', () => ({
  summary: {
    addHeading: jest.fn().mockReturnThis(),
    addTable: jest.fn().mockReturnThis(),
    write: jest.fn().mockReturnThis(),
  },
}));

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

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