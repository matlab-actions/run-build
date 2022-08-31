# Action for Running MATLAB Builds

The [Run MATLAB Build](#run-matlab-build) action enables you to execute MATLAB&reg; builds on a [self-hosted](https://docs.github.com/en/free-pro-team@latest/actions/hosting-your-own-runners/about-self-hosted-runners) or [GitHub&reg;-hosted](https://docs.github.com/en/free-pro-team@latest/actions/reference/specifications-for-github-hosted-runners) runner:

- To use a self-hosted runner, you must set up a computer with MATLAB (R2022b or later) as your runner. The runner uses the topmost MATLAB version on the system path to execute your workflow.

- To use a GitHub-hosted runner, you must include the [Setup MATLAB](https://github.com/matlab-actions/setup-matlab/) action in your workflow to set up MATLAB on the runner. Currently, this action is available only for public projects. It does not set up transformation products, such as MATLAB Coder&trade; and MATLAB Compiler&trade;.

## Examples
Use the **Run MATLAB Build** action to run MATLAB builds using the MATLAB Build Tool. You can use this action to flexibly customize your test run or add a step in MATLAB to your workflow.

### Run MATLAB Build on Self-Hosted Runner
Use a self-hosted runner to run the default tasks in a `buildfile.m` in the root of your repository.

```yaml
name: Run MATLAB Build on Self-Hosted Runner
on: [push]
jobs:
  my-job:
    name: Run MATLAB Build
    runs-on: self-hosted
    steps:
      - name: Check out repository
        uses: actions/checkout@v2
      - name: Run build
        uses: matlab-actions/run-build@v1
```

### Run MATLAB Build on GitHub-Hosted Runner
Before you run MATLAB code or Simulink models on a GitHub-hosted runner, first use the [Setup MATLAB](https://github.com/matlab-actions/setup-matlab/) action. The action sets up your specified MATLAB release (R2020a or later) on a Linux&reg; virtual machine. If you do not specify a release, the action sets up the latest release of MATLAB.

For example, set up the latest release of MATLAB on a GitHub-hosted runner, and then use the **Run MATLAB Build** action to execute your MATLAB build.

```yaml
name: Run MATLAB Build on GitHub-Hosted Runner
on: [push]
jobs:
  my-job:
    name: Run MATLAB Build
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v2
      - name: Set up MATLAB
        uses: matlab-actions/setup-matlab@v1
      - name: Run build
        uses: matlab-actions/run-build@v1
```

## Run MATLAB Build
When you define your workflow in the `.github/workflows` directory of your repository, specify the **Run MATLAB Build** action as `matlab-actions/run-build@v1`. The action requires an input.

Input                     | Description
------------------------- | ---------------
`tasks`                   | (Optional) Space separated list of tasks to execute.<br/>**Example:** `test`<br/>**Example:** `test check`

MATLAB exits with exit code 0 if all tasks in the build execute successfully without error. Otherwise, MATLAB terminates with a nonzero exit code, which causes the build to fail. To fail the build in certain conditions, use the [`assert`](https://www.mathworks.com/help/matlab/ref/assert.html) or [`error`](https://www.mathworks.com/help/matlab/ref/error.html) functions.

When you use this action, a buildfile must be in the project root directory. 

## Notes
* The `buildtool` command is only available in MATLAB R2022b and later, the **Run MATLAB Build** action uses  the `-batch` option to start MATLAB noninteractively. Preferences do not persist across different MATLAB sessions launched with the `-batch` option. To run code that requires  the same preferences, use a single action.
* When you use the **Run MATLAB Build** action, you execute third-party code that is licensed under separate terms.

## See Also
- [Action for Running MATLAB Tests](https://github.com/matlab-actions/run-tests/)
- [Action for Setting Up MATLAB on GitHub-Hosted Runner](https://github.com/matlab-actions/setup-matlab/)
- [Continuous Integration with MATLAB and Simulink](https://www.mathworks.com/solutions/continuous-integration.html)

## Contact Us
If you have any questions or suggestions, please contact MathWorks&reg; at [continuous-integration@mathworks.com](mailto:continuous-integration@mathworks.com).
