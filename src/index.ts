// Copyright 2022-2024 The MathWorks, Inc.

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import { matlab } from "run-matlab-command-action";
import * as buildtool from "./buildtool";

/**
 * Gather action inputs and then run action.
 */
async function run() {
    const platform = process.platform;
    const architecture = process.arch;
    const workspaceDir = process.cwd();
    const pluginResources = '../plugins/+matlab/+ciplugins/+github';
    const pluginDir = workspaceDir + '/.matlab/plugins/+matlab/+ciplugins/+github';

    core.exportVariable('MW_MATLAB_BUILDTOOL_DEFAULT_PLUGINS_FCN_OVERRIDE', 'matlab.ciplugins.github.getDefaultPlugins');
    await io.mkdirP(pluginDir);

    const opt = { recursive: true, force: false }
    await io.cp(pluginResources, pluginDir, opt);

    const options: buildtool.RunBuildOptions = {
        Tasks: core.getInput("tasks"),
        BuildOptions: core.getInput("build-options"),
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

    await io.rmRF(workspaceDir + '/.matlab');
}

run().catch((e) => {
    core.setFailed(e);
});
