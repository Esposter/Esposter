import type { Shape } from "@/src/models/Shape";
import type { TMXFlipsParsed } from "@/src/models/tmx/parsed/TMXFlipsParsed";
import type { TMXPropertiesParsed } from "@/src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXObjectShared } from "@/src/models/tmx/shared/TMXObjectShared";

export interface TMXObjectParsed extends TMXObjectShared {
  name: string;
  value: string;
  shape: Shape;
  points?: [number, number][];
  text?: string;
  flips?: TMXFlipsParsed;
  properties?: TMXPropertiesParsed;
}
