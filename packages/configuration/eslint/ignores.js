// `public` is generated/static assets, the generated tileset `.tsx` included, and oxlint already ignores it.
// Skipping it here too keeps eslint from walking the whole tree calculating a config per file. Shared by both
// Entry configs so the two can never ignore different trees.
export default { ignores: ["**/*.md", "public/**"] };
