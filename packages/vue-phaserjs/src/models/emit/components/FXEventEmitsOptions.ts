import type { FXConfiguration } from "@/models/configuration/components/FXConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type FXEventEmitsOptions = {
  [P in UpdateEvent<keyof FXConfiguration>]: [FXConfiguration[ExtractUpdateEvent<P>]?];
};
