export default {
  // Habilitar transformações necessárias
  transforms: ['imports', 'jsx', 'typescript'],
  
  // Configurações de compatibilidade
  jsxPragma: 'React',
  jsxFragmentPragma: 'React.Fragment',
  production: process.env.NODE_ENV === 'production',
  
  // Configurações de resolução de módulos
  filePath: process.cwd(),
  
  // Opções de source map para depuração
  sourceMapOptions: {
    compiledFilename: 'index.js',
  },
  
  // Configurações de desenvolvimento
  enableLegacyTypeScriptModuleInterop: false,
  enableLegacyBabel5ModuleInterop: false,
  disableESTransforms: false,
  keepUnusedImports: false,
  
  // Configurações de performance
  injectCreateRequireForImportRequire: true,
  preserveDynamicImport: true,
  
  // Configurações de saída
  outDir: './dist',
  exclude: ['**/node_modules/**', '**/__tests__/**', '**/*.test.js', '**/*.spec.js'],
  include: ['src/**/*.js'],
};
