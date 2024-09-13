import type { TransformConfiguration } from "@/models/configuration/components/TransformConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type TransformEventEmitsOptions = {
  [P in UpdateEvent<keyof TransformConfiguration>]: [TransformConfiguration[ExtractUpdateEvent<P>]?];
};
