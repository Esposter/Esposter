import type { TMXFlips } from "@/lib/tmxParser/models/tmx/TMXFlips";
import type { TMXProperties } from "@/lib/tmxParser/models/tmx/TMXProperties";

export interface TMXObject {
  gid: number;
  height: number;
  id: number;
  name: string;
  value: string;
  shape: string;
  type: string;
  width: number;
  x: number;
  y: number;
  flips?: TMXFlips;
  properties?: TMXProperties;
}
