# Action for Running MATLAB Builds

Starting in R2022b, the MATLAB&reg; build tool provides a standard programming interface to create and run tasks in a uniform and efficient way. For example, you can create tasks that identify code issues, run tests, and package a toolbox in a single build file in your project root folder, and then invoke the build tool to run these tasks. For more information, see [Overview of MATLAB Build Tool](https://www.mathworks.com/help/matlab/matlab_prog/overview-of-matlab-build-tool.html).

The [Run MATLAB Build](#run-matlab-build) action enables you to invoke the MATLAB build tool on a [GitHub&reg;-hosted](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners) or [self-hosted](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) runner:
- To use a GitHub-hosted runner, include the [Setup MATLAB](https://github.com/matlab-actions/setup-matlab/) action in your workflow to set up your preferred MATLAB release (R2021a or later) on the runner.
- To use a self-hosted runner, set up a computer with MATLAB on its path and register the runner with GitHub Actions. (On self-hosted UNIX&reg; runners, you can also use the **Setup MATLAB** action instead of having MATLAB already installed.) The runner uses the topmost MATLAB release on the system path to execute your workflow.

## Examples
Use the **Run MATLAB Build** action to run a build using the MATLAB build tool. You can use this action to run the tasks in your build file. (By default, the action looks for a build file named `buildfile.m` in the root of your repository.) To use the **Run MATLAB Build** action, you need MATLAB R2022b or a later release.

### Run Default Tasks in Build File
On a self-hosted runner that has MATLAB installed, run the default tasks in a build file named `buildfile.m` in the root of your repository as well as all the tasks on which they depend. To run the tasks, specify the **Run MATLAB Build** action in your workflow.

```yaml
name: Run Default Tasks in Build File
on: [push]
jobs:
  my-job:
    name: Run MATLAB Build
    runs-on: self-hosted
    steps:
      - name: Check out repository
        uses: actions/checkout@v4
      - name: Run build
        uses: matlab-actions/run-build@v2
```

### Run Specified Task in Build File
Using the latest release of MATLAB on a GitHub-hosted runner, run a task named `mytask`, specified in a build file named `buildfile.m` in the root of your repository, as well as all the tasks on which it depends. To set up the latest release of MATLAB on the runner, specify the [Setup MATLAB](https://github.com/matlab-actions/setup-matlab/) action in your workflow. To run the MATLAB build, specify the **Run MATLAB Build** action.

```yaml
name: Run Specified Task in Build File
on: [push]
jobs:
  my-job:
    name: Run MATLAB Build
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4
      - name: Set up MATLAB
        uses: matlab-actions/setup-matlab@v2
      - name: Run build
        uses: matlab-actions/run-build@v2
        with:
          tasks: mytask
```

### Use MATLAB Batch Licensing Token
When you define a workflow using the [Setup MATLAB](https://github.com/matlab-actions/setup-matlab/) action, you need a [MATLAB batch licensing token](https://github.com/mathworks-ref-arch/matlab-dockerfile/blob/main/alternates/non-interactive/MATLAB-BATCH.md#matlab-batch-licensing-token) if your project is private or if your workflow uses transformation products, such as MATLAB Coder&trade; and MATLAB Compiler&trade;. Batch licensing tokens are strings that enable MATLAB to start in noninteractive environments. You can request a token by submitting the [MATLAB Batch Licensing Pilot](https://www.mathworks.com/support/batch-tokens.html) form. 

To use a MATLAB batch licensing token:

1. Set the token as a secret. For more information about secrets, see [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).
2. Map the secret to an environment variable named `MLM_LICENSE_TOKEN` in your workflow. 

For example, use the latest release of MATLAB on a GitHub-hosted runner to run a MATLAB build in your private project. To set up the latest release of MATLAB on the runner, specify the **Setup MATLAB** action in your workflow. To run the MATLAB build, specify the **Run MATLAB Build** action. In this example, `MyToken` is the name of the secret that holds the batch licensing token.

```YAML
name: Use MATLAB Batch Licensing Token
on: [push]
env:
  MLM_LICENSE_TOKEN: ${{ secrets.MyToken }}
jobs:
  my-job:
    name: Run MATLAB Build in Private Project
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4
      - name: Set up MATLAB
        uses: matlab-actions/setup-matlab@v2
      - name: Run build
        uses: matlab-actions/run-build@v2
```

## Run MATLAB Build
When you define your workflow in the `.github/workflows` directory of your repository, specify the **Run MATLAB Build** action as `matlab-actions/run-build@v2`. The action accepts optional inputs.

Input                     | Description
------------------------- | ---------------
`tasks`                   | <p>(Optional) MATLAB build tasks to run, specified as a list of task names separated by spaces. If a task accepts arguments, enclose them in parentheses. If you do not specify `tasks`, the action runs the default tasks in your build file as well as all the tasks on which they depend. By default, the action looks for a build file named `buildfile.m` in the root of your repository.</p><p>MATLAB exits with exit code 0 if the tasks run without error. Otherwise, MATLAB terminates with a nonzero exit code, which causes the action to fail.</p><p>**Example:** `tasks: test`<br/>**Example:** `tasks: compile test`<br/>**Example:** `tasks: check test("myFolder",OutputDetail="concise") archive("source.zip")`</p>
`build-options`           | <p>(Optional) MATLAB build options, specified as a list of options separated by spaces. The action supports the same [options](https://www.mathworks.com/help/matlab/ref/buildtool.html#mw_50c0f35e-93df-4579-963d-f59f2fba1dba) that you can pass to the `buildtool` command.</p><p>**Example:** `build-options: -continueOnFailure`<br/>**Example:** `build-options: -continueOnFailure -skip test`</p>
`startup-options`         | <p>(Optional) MATLAB startup options, specified as a list of options separated by spaces. For more information about startup options, see [Commonly Used Startup Options](https://www.mathworks.com/help/matlab/matlab_env/commonly-used-startup-options.html).</p><p>Using this input to specify the `-batch` or `-r` option is not supported.</p><p>**Example:** `startup-options: -nojvm`<br/>**Example:** `startup-options: -nojvm -logfile output.log`</p>

## Notes
* By default, when you use the **Run MATLAB Build** action, the root of your repository serves as the MATLAB startup folder. To run your MATLAB build using a different folder, specify the `-sd` startup option in the action.
* The **Run MATLAB Build** action uses the `-batch` option to invoke the [`buildtool`](https://www.mathworks.com/help/matlab/ref/buildtool.html) command. MATLAB settings do not persist across different MATLAB sessions launched with the `-batch` option. To run code that requires the same settings, use a single action.
* When you use the **Run MATLAB Build** action, you execute third-party code that is licensed under separate terms.

## See Also
- [Action for Running MATLAB Tests](https://github.com/matlab-actions/run-tests/)
- [Action for Running MATLAB Commands](https://github.com/matlab-actions/run-command)
- [Action for Setting Up MATLAB](https://github.com/matlab-actions/setup-matlab/)
- [Continuous Integration with MATLAB and Simulink](https://www.mathworks.com/solutions/continuous-integration.html)

## Feedback and Support
If you encounter a product licensing issue, consider requesting a MATLAB batch licensing token to use in your workflow. For more information, see [Use MATLAB Batch Licensing Token](#use-matlab-batch-licensing-token).

If you have an enhancement request or other feedback about this action, create an issue on the [Issues](https://github.com/matlab-actions/run-build/actions) page.

For support, contact [MathWorks Technical Support](https://www.mathworks.com/support/contact_us.html).
