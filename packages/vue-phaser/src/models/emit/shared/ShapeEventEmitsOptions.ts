import type { ShapeConfiguration } from "@/models/configuration/shared/ShapeConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type ShapeEventEmitsOptions = {
  [P in UpdateEvent<keyof ShapeConfiguration>]: [ShapeConfiguration[ExtractUpdateEvent<P>]?];
};
