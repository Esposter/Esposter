import type { TMXEmbeddedTileset } from "@/lib/tmxParser/models/tmx/TMXEmbeddedTileset";
import type { TMXExternalTileset } from "@/lib/tmxParser/models/tmx/TMXExternalTileset";

export type TMXTileset = TMXEmbeddedTileset | TMXExternalTileset;
