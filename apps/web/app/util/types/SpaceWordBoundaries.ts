import type { BaseSpaceWordBoundaries } from "@/util/types/BaseSpaceWordBoundaries";
import type { Trim } from "type-fest";

export type SpaceWordBoundaries<T extends string> = Trim<BaseSpaceWordBoundaries<T>>;
