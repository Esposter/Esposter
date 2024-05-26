import { getPositionId } from "@/util/id/getPositionId";
import type { Position } from "grid-engine";

export const getPositionHash = (position: Position) => Buffer.from(getPositionId(position)).toString("base64");
