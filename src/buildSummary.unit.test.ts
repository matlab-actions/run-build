// Copyright 2024 The MathWorks, Inc.

import * as buildSummary from './buildSummary';
import * as core from '@actions/core';


jest.mock('@actions/core', () => ({
    summary: {
        addTable: jest.fn().mockReturnThis(),
        write: jest.fn().mockReturnThis(),
    },
}));

describe('summaryGeneration', () => {
    it('generates a summary table correctly', () => {
        const mockTasks: buildSummary.Task[] = [
            { name: 'Test Task', description: 'A test task', failed: true, skipped: false, duration: '00:00:10' }
        ];

        const expectedTable = [
            ['MATLAB Build Task', 'Status', 'Description', 'Duration (HH:MM:SS)'],
            ['Test Task', '🔴 Failed', 'A test task', '00:00:10'],
        ];

        const table = buildSummary.getBuildSummaryTable(mockTasks);

        expect(table).toEqual(expectedTable);
    });

    it('writes the summary correctly', () => {
        const mockTableRows = [
            ['MATLAB Build Task', 'Status', 'Description', 'Duration (HH:MM:SS)'],
            ['Test Task', '🔴 Failed', 'A test task', '00:00:10'],
        ];

        buildSummary.writeSummary(mockTableRows);

        expect(core.summary.addTable).toHaveBeenCalledTimes(1);
        expect(core.summary.addTable).toHaveBeenCalledWith(mockTableRows);
    });
});
