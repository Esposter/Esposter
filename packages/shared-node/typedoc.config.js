/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  // The package ships no barrel — the reporter and runner are its only entrypoints, matching `exports`.
  entryPoints: ["src/services/BenchmarkMarkdownReporter.ts", "src/services/StableBenchmarkRunner.ts"],
};

export default typedocConfiguration;
