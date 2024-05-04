import type { TMXBaseTileset } from "@/lib/tmxParser/models/tmx/TMXBaseTileset";

export interface TMXExternalTileset extends TMXBaseTileset {
  source: string;
}
