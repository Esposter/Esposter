import { ID_SEPARATOR } from "@/util/id/constants";
import type { Position } from "grid-engine";

export const getChestPosition = (id: string): Position => {
  const [x, y] = id.split(ID_SEPARATOR);
  return { x: Number(x), y: Number(y) };
};
