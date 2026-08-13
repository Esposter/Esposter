/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  // The package's two published entrypoints: the library barrel (`virrun`) and the tiny `virrun/config`
  // Subpath a `virrun.config.ts` imports. The `cli` input is the bin, not API surface, so it stays undocumented.
  entryPoints: ["src/index.ts", "src/services/configuration/defineConfig.ts"],
  intentionallyNotExported: ["ExecFileHiddenOptions"],
};

export default typedocConfiguration;
