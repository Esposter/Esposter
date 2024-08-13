import type { Position } from "grid-engine";

import { ID_SEPARATOR } from "@/util/id/constants";

export const getChestPosition = (id: string): Position => {
  const [x, y] = id.split(ID_SEPARATOR);
  return { x: Number(x), y: Number(y) };
};
