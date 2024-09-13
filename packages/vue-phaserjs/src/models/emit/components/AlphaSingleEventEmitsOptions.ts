import type { AlphaSingleConfiguration } from "@/models/configuration/components/AlphaSingleConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type AlphaSingleEventEmitsOptions = {
  [P in UpdateEvent<keyof AlphaSingleConfiguration>]: [AlphaSingleConfiguration[ExtractUpdateEvent<P>]?];
};
