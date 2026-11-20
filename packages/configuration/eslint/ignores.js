import { TILESET_IGNORE_PATTERN } from "../../../oxlint.config.ts";

// `public` is generated/static assets, and so are the Tiled tileset `.tsx` files under `assets`.
// ESLint would otherwise parse those as TypeScript, and skipping them keeps it from walking the whole tree.
// The tileset glob is oxlint.config.ts's, so the two entry configs can never ignore different trees.
export default { ignores: ["**/*.md", "public/**", TILESET_IGNORE_PATTERN] };

// The suites, benches and type tests a source-only override leaves to the test override
export const TEST_FILE_PATTERNS = ["**/*.bench.ts", "**/*.test-d.ts", "**/*.test.ts"];
