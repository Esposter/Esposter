/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  // The module and each public runtime file are its entrypoints, matching `exports`, which leaves the runtime's own
  // `services` out
  entryPoints: ["src/module.ts", "src/runtime/constants.ts", "src/runtime/*/*/*.ts"],
  exclude: ["**/*.bench.ts", "**/*.test-d.ts", "**/*.test.ts"],
};

export default typedocConfiguration;
