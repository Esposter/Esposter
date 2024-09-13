import type { VisibleConfiguration } from "@/models/configuration/components/VisibleConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type VisibleEventEmitsOptions = {
  [P in UpdateEvent<keyof VisibleConfiguration>]: [VisibleConfiguration[ExtractUpdateEvent<P>]?];
};
