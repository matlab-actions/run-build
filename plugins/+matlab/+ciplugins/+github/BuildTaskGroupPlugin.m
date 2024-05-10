classdef BuildTaskGroupPlugin < matlab.buildtool.plugins.BuildRunnerPlugin

%   Copyright 2024 The MathWorks, Inc.

    methods (Access=protected)

        function runTask(plugin, pluginData)
           % Add Github worflow command for grouping the tasks
           disp("::group::" + pluginData.TaskResults.Name + " - task");

           runTask@matlab.buildtool.plugins.BuildRunnerPlugin(plugin, pluginData);

           % Add Github workflow command ::error:: if the task is failed
           if pluginData.TaskResults.Failed
              disp("::error::" + pluginData.TaskResults.Name + " - task");
           end

           % Complete the group command
           disp("::endgroup::");
        end
    end
 end