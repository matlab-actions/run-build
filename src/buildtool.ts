// Copyright 2022-2024 The MathWorks, Inc.
import * as path from "path";

export interface RunBuildOptions {
    Tasks?: string;
    BuildOptions?: string;
}

export function generateCommand(options: RunBuildOptions): string {
    let command: string = "disp('nnn"+__dirname+"'),addpath('"+ path.join(__dirname, "plugins") +"');buildtool"
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    if (options.BuildOptions) {
        command = command + " " + options.BuildOptions;
    }
    
    return command;
}
