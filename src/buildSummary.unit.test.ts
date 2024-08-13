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
    it('writes the summary correctly', () => {
        const mockTableRows = [
            ['MATLAB Build Task', 'Status', 'Description', 'Duration (hh:mm:ss)'],
            ['Test Task', '🔴 Failed', 'A test task', '00:00:10'],
        ];

        buildSummary.writeSummary(mockTableRows);

        expect(core.summary.addTable).toHaveBeenCalledTimes(1);
        expect(core.summary.addTable).toHaveBeenCalledWith(mockTableRows);
    });
});
