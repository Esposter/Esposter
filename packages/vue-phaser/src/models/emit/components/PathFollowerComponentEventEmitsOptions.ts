import type { PathFollowerComponentConfiguration } from "@/models/configuration/components/PathFollowerComponentConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type PathFollowerComponentEventEmitsOptions = {
  [P in UpdateEvent<keyof PathFollowerComponentConfiguration>]: [
    PathFollowerComponentConfiguration[ExtractUpdateEvent<P>]?,
  ];
};
