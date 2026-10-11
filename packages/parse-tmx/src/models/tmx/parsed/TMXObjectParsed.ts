import type { Shape } from "#src/models/Shape";
import type { TMXFlipsParsed } from "#src/models/tmx/parsed/TMXFlipsParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";

export interface TMXObjectParsed {
  flips?: TMXFlipsParsed;
  gid?: number;
  height: number;
  id: number;
  name: string;
  points?: [number, number][];
  properties?: TMXPropertiesParsed;
  rotation?: number;
  shape: Shape;
  template?: string;
  text?: string;
  type: string;
  visible?: number;
  width: number;
  x: number;
  y: number;
}
