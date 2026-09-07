import type { Position } from "grid-engine";

import { ID_SEPARATOR } from "@esposter/shared";

export const getChestPosition = (id: string): Position => {
  const [x, y] = id.split(ID_SEPARATOR);
  return { x: Number(x), y: Number(y) };
};
