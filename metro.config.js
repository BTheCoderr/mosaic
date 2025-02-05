const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  
  return {
    ...defaultConfig,
    maxWorkers: 8, // Adjust based on your CPU cores
    resetCache: false,
    transformer: {
      ...defaultConfig.transformer,
      enableBabelRCLookup: false, // Faster startup
      enableBabelRuntime: true,
      experimentalImportSupport: false,
      inlineRequires: true, // Faster requires
    },
    watchFolders: [__dirname],
    resolver: {
      ...defaultConfig.resolver,
      useWatchman: true,
      enableGlobalPackages: true, // Faster module resolution
      extraNodeModules: new Proxy({}, {
        get: (target, name) => path.join(process.cwd(), `node_modules/${name}`),
      }),
    },
  };
})();
