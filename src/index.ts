// Copyright 2022-2024 The MathWorks, Inc.

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { matlab } from "run-matlab-command-action";
import * as buildtool from "./buildtool";
import * as buildSummary from "./buildSummary";

/**
 * Gather action inputs and then run action.
 */
async function run() {
    try {

        const platform = process.platform;
        const architecture = process.arch;
        const workspaceDir = process.cwd();

        const options: buildtool.RunBuildOptions = {
            Tasks: core.getInput("tasks"),
            BuildOptions: core.getInput("build-options"),
        };

        const command = buildtool.generateCommand(options);
        const startupOptions = core.getInput("startup-options").split(" ");

        const helperScript = await matlab.generateScript(workspaceDir, command);
        const execOptions = {
            env: {
                ...process.env,
                "MW_MATLAB_BUILDTOOL_DEFAULT_PLUGINS_FCN_OVERRIDE": "ciplugins.github.getDefaultPlugins",
            }
        };

        await matlab.runCommand(
            helperScript,
            platform,
            architecture,
            (cmd, args) => exec.exec(cmd, args, execOptions),
            startupOptions
        );

        buildSummary.processAndDisplayBuildSummary();

    } catch (e) {
        try {
            buildSummary.processAndDisplayBuildSummary();
        } catch (summaryError) {
            console.error('An error occurred while reading the build summary file or adding the build summary table:', summaryError);
        }
        if (e instanceof Error || typeof e === "string") {
            core.setFailed(e);
        } else {
            core.setFailed("An unknown error occurred while runing MATLAB build.");
        }
        
    }

}

run();