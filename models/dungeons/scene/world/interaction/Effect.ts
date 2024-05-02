import type { Position } from "grid-engine";
import type { Types } from "phaser";
import type { SetRequired } from "type-fest";

export type Effect = (objects: SetRequired<Types.Tilemaps.TiledObject, keyof Position>[]) => void;
