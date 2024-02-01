# Action for Running MATLAB Builds

Starting in R2022b, the MATLAB&reg; build tool provides a standard programming interface to create and run software-build tasks in a uniform and efficient way. For example, you can create tasks that identify code issues, run tests, and package a toolbox in a single build file in your project root folder, and then invoke the build tool to run these tasks. For more information, see [Overview of MATLAB Build Tool](https://www.mathworks.com/help/matlab/matlab_prog/overview-of-matlab-build-tool.html).

The [Run MATLAB Build](#run-matlab-build) action enables you to invoke the MATLAB build tool on a self-hosted or GitHub&reg;-hosted runner. The action uses the topmost MATLAB version on the system path.

## Examples
Use the **Run MATLAB Build** action to run a build using the MATLAB build tool. You can use this action to run the tasks specified in a file named  `buildfile.m` in the root of your repository.

### Run MATLAB Build on Self-Hosted Runner
Use a [self-hosted runner](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners) to run the default tasks in your build plan as well as all the tasks on which they depend.

```yaml
name: Run MATLAB Build on Self-Hosted Runner
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

### Run MATLAB Build on GitHub-Hosted Runner
Before you run MATLAB code or Simulink models on a [GitHub-hosted runner](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners), first use the [Setup MATLAB](https://github.com/matlab-actions/setup-matlab/) action. The action sets up your specified MATLAB release (R2021a or later) on on a Linux&reg;, Windows&reg;, or macOS&reg; virtual machine. If you do not specify a release, the action sets up the latest release of MATLAB. To use the **Run MATLAB Build** action, you need MATLAB R2022b or a later release.

For example, set up the latest release of MATLAB on a GitHub-hosted runner, and then use the **Run MATLAB Build** action to run a specific task and the tasks on which it depends.

```yaml
name: Run MATLAB Build on GitHub-Hosted Runner
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

## Run MATLAB Build
When you define your workflow in the `.github/workflows` directory of your repository, specify the **Run MATLAB Build** action as `matlab-actions/run-build@v2`. The action accepts optional inputs.

Input                     | Description
------------------------- | ---------------
`tasks`                   | <p>(Optional) Tasks to run, specified as a list of task names separated by spaces. If not specified, the action runs the default tasks in `buildfile.m` as well as all the tasks on which they depend.</p><p>MATLAB exits with exit code 0 if the tasks run without error. Otherwise, MATLAB terminates with a nonzero exit code, which causes the workflow to fail.<p/><p>**Example:** `tasks: test`</br>**Example:** `tasks: compile test`</p>
`build-options`           | <p>(Optional) MATLAB build options, specified as a list of options separated by spaces. The action supports the same [options](https://www.mathworks.com/help/matlab/ref/buildtool.html#mw_50c0f35e-93df-4579-963d-f59f2fba1dba) that you can pass to the [`buildtool`](https://www.mathworks.com/help/matlab/ref/buildtool.html) command when running a MATLAB build.<p/><p>**Example:** `build-options: -continueOnFailure`<br/>**Example:** `build-options: -continueOnFailure -skip test`</p>
`startup-options`         | <p>(Optional) MATLAB startup options, specified as a list of options separated by spaces. For more information about startup options, see [Commonly Used Startup Options](https://www.mathworks.com/help/matlab/matlab_env/commonly-used-startup-options.html).<p/><p>Using this input to specify the `-batch` or `-r` option is not supported.<p/><p>**Example:** `startup-options: -nojvm`<br/>**Example:** `startup-options: -nojvm -logfile output.log`</p>

When you use this action, a file named `buildfile.m` must be in the project root directory. 

## Notes
* The **Run MATLAB Build** action uses the `-batch` option to invoke the [`buildtool`](https://www.mathworks.com/help/matlab/ref/buildtool.html) command noninteractively. Preferences do not persist across different MATLAB sessions launched with the `-batch` option. To run code that requires the same preferences, use a single action.

* When you use the **Run MATLAB Build** action, you execute third-party code that is licensed under separate terms.

## See Also
- [Create and Run Tasks Using Build Tool](https://www.mathworks.com/help/matlab/matlab_prog/create-and-run-tasks-using-build-tool.html)
- [Action for Running MATLAB Tests](https://github.com/matlab-actions/run-tests/)
- [Action for Running MATLAB Commands](https://github.com/matlab-actions/run-command)
- [Action for Setting Up MATLAB](https://github.com/matlab-actions/setup-matlab/)
- [Continuous Integration with MATLAB and Simulink](https://www.mathworks.com/solutions/continuous-integration.html)

## Contact Us
If you have any questions or suggestions, please contact MathWorks&reg; at [continuous-integration@mathworks.com](mailto:continuous-integration@mathworks.com).
