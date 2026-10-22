// `public` is generated/static assets, and so are the Tiled tileset `.tsx` files under `assets`, which ESLint would
// Otherwise parse as TypeScript. Skipping them here keeps eslint from walking the whole tree calculating a config per
// File. Shared by both entry configs so the two can never ignore different trees.
export default { ignores: ["**/*.md", "public/**", "**/assets/dungeons/tilesets/**/*.tsx"] };
