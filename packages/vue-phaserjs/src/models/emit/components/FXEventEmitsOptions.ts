import type { FXConfiguration } from "@/models/configuration/components/FXConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type FXEventEmitsOptions = {
  [P in UpdateEvent<keyof FXConfiguration>]: [FXConfiguration[ExtractUpdateEvent<P>]?];
};
