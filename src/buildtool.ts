// Copyright 2022-2025 The MathWorks, Inc.

export interface RunBuildOptions {
    Tasks?: string;
    BuildOptions?: string;
}

export function generateCommand(options: RunBuildOptions): string {
    let command: string = "buildtool"
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    if (options.BuildOptions) {
        command = command + " " + options.BuildOptions;
    }
    
    return command;
}
