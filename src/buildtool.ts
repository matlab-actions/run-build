// Copyright 2022-2024 The MathWorks, Inc.
import * as path from "path";

export interface RunBuildOptions {
    Tasks?: string;
    BuildOptions?: string;
}

export function generateCommand(options: RunBuildOptions): string {
    const pluginsPath = path.join(__dirname,"plugins").replaceAll("'","''");
    let command: string = "addpath('"+ pluginsPath +"'); buildtool"
    if (options.Tasks) {
        command = command + " " + options.Tasks;
    }
    if (options.BuildOptions) {
        command = command + " " + options.BuildOptions;
    }
    
    return command;
}
