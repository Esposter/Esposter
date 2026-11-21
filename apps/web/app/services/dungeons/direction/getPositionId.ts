import type { Position } from "grid-engine-headless";

import { ID_SEPARATOR } from "@esposter/shared";

export const getPositionId = ({ x, y }: Position) => `${x}${ID_SEPARATOR}${y}`;
