import { z } from "zod";

export enum TilemapKey {
  Home = "Home",
}

export const tilemapKeySchema = z.nativeEnum(TilemapKey);
