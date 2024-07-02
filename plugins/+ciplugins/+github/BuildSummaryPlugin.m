classdef BuildSummaryPlugin < matlab.buildtool.plugins.BuildRunnerPlugin

%   Copyright 2024 The MathWorks, Inc.

    methods (Access=protected)

        function runTaskGraph(plugin, pluginData)
            runTaskGraph@matlab.buildtool.plugins.BuildRunnerPlugin(plugin, pluginData);
            [fID, msg] = fopen(fullfile(getenv("RUNNER_TEMP") ,"buildSummary" + getenv("GITHUB_RUN_ID") + ".json"), "w");

            if fID == -1
                warning("ciplugins:github:BuildSummaryPlugin:UnableToOpenFile","Unable to open a file required to create the MATLAB build summary table: %s", msg);
            else
                closeFile = onCleanup(@()fclose(fID));
                taskDetails = struct();
                for idx = 1:numel(pluginData.TaskResults)
                    taskDetails(idx).name = pluginData.TaskResults(idx).Name;
                    taskDetails(idx).description = pluginData.TaskGraph.Tasks(idx).Description;
                    taskDetails(idx).failed = pluginData.TaskResults(idx).Failed;
                    taskDetails(idx).skipped = pluginData.TaskResults(idx).Skipped;
                    taskDetails(idx).duration = string(pluginData.TaskResults(idx).Duration);
                end
                s = jsonencode(taskDetails);
                fprintf(fID, "%s",s);
            end
        end
    end
end