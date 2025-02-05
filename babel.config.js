module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
  plugins: [
    ['@babel/plugin-transform-runtime', { helpers: true }],
    'react-native-reanimated/plugin', // Add only if you use reanimated
  ],
  assumptions: {
    setPublicClassFields: true,
    privateFieldsAsProperties: true,
  },
  compact: true,
  // Cache configuration
  cacheDirectory: true,
  cacheCompression: false,
};
