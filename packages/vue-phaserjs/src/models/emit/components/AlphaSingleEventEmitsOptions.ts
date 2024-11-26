import type { AlphaSingleConfiguration } from "@/models/configuration/components/AlphaSingleConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type AlphaSingleEventEmitsOptions = {
  [P in UpdateEvent<keyof AlphaSingleConfiguration>]: [AlphaSingleConfiguration[ExtractUpdateEvent<P>]?];
};
