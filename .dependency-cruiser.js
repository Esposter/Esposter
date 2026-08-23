export default {
  options: {
    // Dependency-cruiser ignores `exports` maps by default (it defaults
    // `exportsFields` to `[]` for backwards compatibility). Every package here
    // Dropped `main` for an `exports` map in the tsdown migration, so without
    // This every `@esposter/*` import resolves to nothing and the graph has no
    // Edges. `source` is this repo's workspace-source condition, so siblings
    // Resolve to `src/` rather than a built `dist/`.
    enhancedResolveOptions: {
      conditionNames: ["source", "import", "require", "node", "default", "types"],
      exportsFields: ["exports"],
    },
    reporterOptions: {
      dot: {
        theme: {
          edge: {
            fontname: "Times",
          },
          graph: {
            fontname: "Times",
          },
          node: {
            fontname: "Times",
          },
        },
      },
    },
  },
};
