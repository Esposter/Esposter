import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ShapeEventEmitsOptions = {
  [P in UpdateEvent<keyof ShapeConfiguration>]: [ShapeConfiguration[ExtractUpdateEvent<P>]?];
};
