/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  // The package ships no barrel — the module and each public runtime file are its entrypoints, matching `exports`,
  // Which leaves the runtime's own `services` out
  entryPoints: ["src/module.ts", "src/runtime/constants.ts", "src/runtime/*/*.ts", "src/runtime/*/models/*.ts"],
  exclude: ["**/*.bench.ts", "**/*.test-d.ts", "**/*.test.ts"],
};

export default typedocConfiguration;
