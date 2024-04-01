classdef BuildTaskGroupPlugin < matlab.buildtool.plugins.BuildRunnerPlugin
%

%   Copyright 2024 The MathWorks, Inc.

    methods (Access=protected)

        function runTask(plugin, pluginData)
            disp("::group::" + pluginData.TaskResults.Name );
            runTask@matlab.buildtool.plugins.BuildRunnerPlugin(plugin, pluginData);
            disp("::endgroup::");
        end
    end
 end