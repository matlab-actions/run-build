// Copyright 2022-2024 The MathWorks, Inc.

export interface RunBuildOptions {
    Tasks?: string;
    BuildOptions?: string;
}

export function generateCommand(options: RunBuildOptions): string {
    let command: string = 'addpath(genpath('${process.cwd()}/.matlab/plugins'));\n buildtool';
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    if (options.BuildOptions) {
        command = command + " " + options.BuildOptions;
    }
    
    return command;
}
