// Copyright 2022-2024 The MathWorks, Inc.

export interface RunBuildOptions {
    Tasks?: string;
    AdditionalBuildOptions?: string;
}

export function generateCommand(options: RunBuildOptions): string {
    let command: string = "buildtool";
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    if (options.AdditionalBuildOptions) {
        command = command + " " + options.AdditionalBuildOptions + " -ignoreUnknownOptions";
    }
    
    return command;
}
