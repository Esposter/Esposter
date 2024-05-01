import type { TMXImage } from "@/lib/tmxParser/models/tmx/TMXImage";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";

export interface TMXLayer {
  id: number;
  name: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  opacity?: number;
  properties: Record<string, unknown> | null;
  type: string;
  visible: number;
  tintcolor?: string;
  offsetx?: number;
  offsety?: number;
  parallaxx?: number;
  parallaxy?: number;
  data?: (number | null)[];
  objects?: TMXObject[];
  image?: TMXImage;
}
