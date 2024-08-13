import type { Position } from "grid-engine";

import { ID_SEPARATOR } from "@/util/id/constants";

export const getPositionId = ({ x, y }: Position) => `${x}${ID_SEPARATOR}${y}`;
