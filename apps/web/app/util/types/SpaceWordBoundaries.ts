import type { BaseSpaceWordBoundaries } from "#src/util/types/BaseSpaceWordBoundaries";
import type { Trim } from "type-fest";

export type SpaceWordBoundaries<T extends string> = Trim<BaseSpaceWordBoundaries<T>>;
