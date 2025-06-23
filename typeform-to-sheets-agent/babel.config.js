export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      modules: 'auto',
    }],
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime'
  ],
  sourceMaps: 'inline',
  retainLines: true,
};
