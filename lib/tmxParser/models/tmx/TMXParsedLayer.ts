import type { TMXBaseLayer } from "@/lib/tmxParser/models/tmx/TMXBaseLayer";

export interface TMXParsedLayer extends TMXBaseLayer {
  data?: number[];
}
