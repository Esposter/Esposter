import type { Shape } from "@/models/Shape";
import type { TMXFlipsParsed } from "@/models/tmx/parsed/TMXFlipsParsed";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXObjectShared } from "@/models/tmx/shared/TMXObjectShared";

export interface TMXObjectParsed extends TMXObjectShared {
  name: string;
  value: string;
  shape: Shape;
  points?: [number, number][];
  text?: string;
  flips?: TMXFlipsParsed;
  properties?: TMXPropertiesParsed;
}
