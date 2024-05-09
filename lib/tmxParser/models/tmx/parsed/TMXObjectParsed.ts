import type { Shape } from "@/lib/tmxParser/models/Shape";
import type { TMXFlipsParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXFlipsParsed";
import type { TMXPropertiesParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXObjectShared } from "@/lib/tmxParser/models/tmx/shared/TMXObjectShared";

export interface TMXObjectParsed extends TMXObjectShared {
  name: string;
  value: string;
  shape: Shape;
  points?: [number, number][];
  text?: string;
  flips?: TMXFlipsParsed;
  properties?: TMXPropertiesParsed;
}
