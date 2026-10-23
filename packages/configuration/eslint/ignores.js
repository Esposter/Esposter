import { TILESET_IGNORE_PATTERN } from "../../../oxlint.config.ts";

// `public` is generated/static assets, and so are the Tiled tileset `.tsx` files under `assets`.
// ESLint would otherwise parse those as TypeScript, and skipping them keeps it from walking the whole tree.
// The tileset glob is oxlint.config.ts's, so the two entry configs can never ignore different trees.
export default { ignores: ["**/*.md", "public/**", TILESET_IGNORE_PATTERN] };
