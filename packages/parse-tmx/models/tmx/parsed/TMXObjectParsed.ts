import type { Shape } from "parse-tmx/models/Shape";
import type { TMXFlipsParsed } from "parse-tmx/models/tmx/parsed/TMXFlipsParsed";
import type { TMXPropertiesParsed } from "parse-tmx/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXObjectShared } from "parse-tmx/models/tmx/shared/TMXObjectShared";

export interface TMXObjectParsed extends TMXObjectShared {
  name: string;
  value: string;
  shape: Shape;
  points?: [number, number][];
  text?: string;
  flips?: TMXFlipsParsed;
  properties?: TMXPropertiesParsed;
}
