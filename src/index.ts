// Copyright 2022-2024 The MathWorks, Inc.

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as buildtool from "./buildtool";
import { matlab, testResultsSummary, buildSummary } from "common-utils";

/**
 * Gather action inputs and then run action.
 */
async function run() {

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
            MW_BATCH_LICENSING_ONLINE:'true', // Remove when online batch licensing is the default
            "MW_MATLAB_BUILDTOOL_DEFAULT_PLUGINS_FCN_OVERRIDE": "buildframework.getDefaultPlugins",
        }
    };

    await matlab.runCommand(
        helperScript,
        platform,
        architecture,
        (cmd, args) => exec.exec(cmd, args, execOptions),
        startupOptions
    ).finally(() => {
        const runnerTemp = process.env.RUNNER_TEMP || '';
        const runId = process.env.GITHUB_RUN_ID || '';
        const actionName = process.env.GITHUB_ACTION || '';

        buildSummary.processAndAddBuildSummary(runnerTemp, runId, actionName);
        testResultsSummary.processAndAddTestSummary(runnerTemp, runId, actionName, workspaceDir);
        core.summary.write();
    });

}

run().catch(e => {
    core.setFailed(e);
});