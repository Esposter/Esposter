// `public` is generated/static assets, and so are the Tiled tileset `.tsx` files under `assets`.
// ESLint would otherwise parse those as TypeScript, and skipping them keeps it from walking the whole tree.
// Shared by both entry configs so the two can never ignore different trees.
export default { ignores: ["**/*.md", "public/**", "**/assets/dungeons/tilesets/**/*.tsx"] };
