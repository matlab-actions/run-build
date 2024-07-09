export interface Task {
    name: string;
    description: string;
    failed: boolean;
    skipped: boolean;
    duration: string;
}
export declare function getBuildSummaryTable(tasks: Task[]): string[][];
export declare function writeSummary(taskSummaryTableRows: string[][]): void;
export declare function processAndDisplayBuildSummary(): void;
export declare function getTaskDetails(tasks: Task): string[];
export declare function getTaskSummaryRows(task: Task, taskSummaryTableRows: string[][]): string[][];
