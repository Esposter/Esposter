import { ID_SEPARATOR } from "@/util/id/constants";
import type { Position } from "grid-engine";

export const getChestId = ({ x, y }: Position) => `${x}${ID_SEPARATOR}${y}`;
