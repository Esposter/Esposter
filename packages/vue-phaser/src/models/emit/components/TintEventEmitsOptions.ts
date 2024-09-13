import type { TintConfiguration } from "@/models/configuration/components/TintConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type TintEventEmitsOptions = {
  [P in UpdateEvent<keyof TintConfiguration>]: [TintConfiguration[ExtractUpdateEvent<P>]?];
};
