classdef BuildSummaryPlugin < matlab.buildtool.plugins.BuildRunnerPlugin

%   Copyright 2024 The MathWorks, Inc.

    methods (Access=protected)

        function runTaskGraph(plugin, pluginData)
            runTaskGraph@matlab.buildtool.plugins.BuildRunnerPlugin(plugin, pluginData);
            [fID, msg] = fopen(fullfile(getenv("RUNNER_TEMP") ,"buildSummary_" + getenv("GITHUB_RUN_ID") + ".json"), "w");

            if fID == -1
                warning("ciplugins:github:BuildSummaryPlugin:UnableToOpenFile","Could not open a file for GitHub build summary table due to: %s", msg);
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
                a = struct("taskDetails",taskDetails);
                s = jsonencode(a);
                fprintf(fID, "%s",s);
            end
        end
    end
end