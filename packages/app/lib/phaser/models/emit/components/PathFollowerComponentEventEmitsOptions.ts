import type { PathFollowerComponentConfiguration } from "@/lib/phaser/models/configuration/components/PathFollowerComponentConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type PathFollowerComponentEventEmitsOptions = {
  [P in UpdateEvent<keyof PathFollowerComponentConfiguration>]: [
    PathFollowerComponentConfiguration[ExtractUpdateEvent<P>]?,
  ];
};
