import type { Compression } from "@/lib/tmxParser/models/Compression";
import type { Encoding } from "@/lib/tmxParser/models/Encoding";
import type { TMXBaseLayer } from "@/lib/tmxParser/models/tmx/TMXBaseLayer";
import type { TMXImage } from "@/lib/tmxParser/models/tmx/TMXImage";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import type { TMXProperties } from "@/lib/tmxParser/models/tmx/TMXProperties";

export interface TMXLayer extends TMXBaseLayer {
  data?: TMXNode<{ tile: TMXNode<TMXObject>[]; encoding: Encoding; compression?: Compression | null }>[];
  objects?: TMXObject[];
  image?: TMXImage;
  properties: TMXProperties;
}
