import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXProperties } from "@/lib/tmxParser/models/tmx/TMXProperties";

export interface TMXLayerGroup {
  id: number;
  type: string;
  name: string;
  layers: TMXLayer[];
  properties?: TMXProperties;
}
