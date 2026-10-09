// The build's stand-in for a book body's `index.chunk.ts`: its shape only, so the declaration program never reads the
// Chunk or its JSON. The real module is typed by `tsconfig.json` in the typecheck.
import type { GameLanguage } from "genshin-text";

declare const chunk: Readonly<Record<GameLanguage, () => Promise<string>>>;
export default chunk;
