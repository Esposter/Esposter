import type { Shape } from "@/models/Shape";
import type { TMXFlipsParsed } from "@/models/tmx/parsed/TMXFlipsParsed";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXObjectShared } from "@/models/tmx/shared/TMXObjectShared";

export interface TMXObjectParsed extends TMXObjectShared {
  flips?: TMXFlipsParsed;
  name: string;
  points?: [number, number][];
  properties?: TMXPropertiesParsed;
  shape: Shape;
  text?: string;
  value: string;
}
