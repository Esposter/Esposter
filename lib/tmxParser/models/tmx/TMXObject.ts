import type { TMXFlips } from "@/lib/tmxParser/models/tmx/TMXFlips";

export interface TMXObject {
  gid: number;
  height: number;
  id: number;
  name: string;
  properties: Record<string, unknown> | null;
  shape: string;
  type: string;
  width: number;
  x: number;
  y: number;
  flips?: TMXFlips;
}
