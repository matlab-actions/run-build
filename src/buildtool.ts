// Copyright 2022 The MathWorks, Inc.

export interface RunBuildOptions {
    Tasks?: string;
}

export function generateCommand(options: RunBuildOptions): string {
    let command: string = "buildtool";
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    return command
}
