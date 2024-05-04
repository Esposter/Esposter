import type { TMXBaseLayer } from "@/lib/tmxParser/models/tmx/TMXBaseLayer";
import type { TMXImage } from "@/lib/tmxParser/models/tmx/TMXImage";
import type { TMXObject } from "@/lib/tmxParser/models/tmx/TMXObject";
import type { TMXParsedProperties } from "@/lib/tmxParser/models/tmx/TMXParsedProperties";

export interface TMXParsedLayer extends TMXBaseLayer {
  data?: number[];
  objects?: TMXObject[];
  image?: TMXImage;
  properties?: TMXParsedProperties;
}
