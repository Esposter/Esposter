// The server plugin the module writes at each build.
// It calls one of the runtime's plugin factories with the build's data.
// The runtime cannot import that data itself, since the module's virtual modules exist only in the app's build.
export const getPluginTemplate = (factoryPath: string, factoryName: string, dataPath: string): string =>
  [
    `import { ${factoryName} } from ${JSON.stringify(factoryPath)};`,
    `import data from ${JSON.stringify(dataPath)};`,
    "",
    `export default ${factoryName}(data);`,
    "",
  ].join("\n");
