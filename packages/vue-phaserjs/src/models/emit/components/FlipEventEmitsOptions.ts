import type { FlipConfiguration } from "@/models/configuration/components/FlipConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type FlipEventEmitsOptions = {
  [P in UpdateEvent<keyof FlipConfiguration>]: [FlipConfiguration[ExtractUpdateEvent<P>]?];
};
