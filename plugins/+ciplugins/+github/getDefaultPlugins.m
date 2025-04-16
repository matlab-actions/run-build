function plugins = getDefaultPlugins(pluginProviderData)

%   Copyright 2024-2025 The MathWorks, Inc.

arguments
    pluginProviderData (1,1) struct = struct();
end

disp(string({matlab.metadata.Namespace.fromName("matlab.mixin").ClassList.Name})');

if isMATLABReleaseOlderThan("R2025b")
    reportPlugin = ciplugins.github.BuildSummaryPlugin();
else
    reportPlugin = ciplugins.github.ParallelizableBuildSummaryPlugin();
end

plugins = [ ...
    matlab.buildtool.internal.getFactoryDefaultPlugins(pluginProviderData) ...
    ciplugins.github.GitHubLogPlugin() ...
    reportPlugin ...
];
end
