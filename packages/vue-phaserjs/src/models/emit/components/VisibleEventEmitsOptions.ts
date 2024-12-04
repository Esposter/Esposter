import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type VisibleEventEmitsOptions = {
  [P in UpdateEvent<keyof VisibleConfiguration>]: [VisibleConfiguration[ExtractUpdateEvent<P>]?];
};
