import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TransformEventEmitsOptions = {
  [P in UpdateEvent<keyof TransformConfiguration>]: [TransformConfiguration[ExtractUpdateEvent<P>]?];
};
