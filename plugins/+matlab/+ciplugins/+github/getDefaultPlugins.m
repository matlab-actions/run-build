function plugins = getDefaultPlugins(pluginProviderData)

%   Copyright 2024 The MathWorks, Inc.

arguments
    pluginProviderData (1,1) struct = struct();
end

plugins = [ ...
    matlab.buildtool.internal.getFactoryDefaultPlugins(pluginProviderData) ...
    matlab.ciplugins.github.BuildTaskGroupPlugin() ...
];
end