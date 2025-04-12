import type { Type } from "arktype";

import { type } from "arktype";
import { Direction } from "grid-engine";

export const directionSchema = type.valueOf(Direction) satisfies Type<Direction>;
