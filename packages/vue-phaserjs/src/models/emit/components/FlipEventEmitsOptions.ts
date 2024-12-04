import type { FlipConfiguration } from "@/models/configuration/components/FlipConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type FlipEventEmitsOptions = {
  [P in UpdateEvent<keyof FlipConfiguration>]: [FlipConfiguration[ExtractUpdateEvent<P>]?];
};
