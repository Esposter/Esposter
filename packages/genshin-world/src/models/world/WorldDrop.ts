import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { GroundPoint } from "genshin-engine";

// A drop lying on the ground: its item and count, an id no other drop of the page has, and the ground point it lies at
export interface WorldDrop extends DroppedItem {
  id: string;
  position: GroundPoint;
}
