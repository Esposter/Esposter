import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";

export interface TMXLayerGroup {
  id: number;
  layers: TMXLayer[];
  name: string;
  properties: Record<string, unknown> | null;
  type: string;
}
