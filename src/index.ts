// Copyright 2022 The MathWorks, Inc.

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { matlab } from "run-matlab-command-action";
import * as buildtool from "./buildtool";

/**
 * Gather action inputs and then run action.
 */
async function run() {
    const platform = process.platform;
    const architecture = process.arch;
    const workspaceDir = process.cwd();

    const options: buildtool.RunBuildOptions = {
        Tasks: core.getInput("tasks"),
    };

    const command = buildtool.generateCommand(options);
    const startupOptions = core.getInput("startup-options").split(" ");

    const helperScript = await core.group("Generate script", async () => {
        const helperScript = await matlab.generateScript(workspaceDir, command);
        core.info("Successfully generated script");
        return helperScript;
    });

    await core.group("Run command", async () => {
        await matlab.runCommand(helperScript, platform, architecture, exec.exec, startupOptions);
    });
}

run().catch((e) => {
    core.setFailed(e);
});
