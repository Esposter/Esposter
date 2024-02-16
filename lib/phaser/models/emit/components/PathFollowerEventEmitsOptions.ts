import { type PathFollowerConfiguration } from "@/lib/phaser/models/configuration/components/PathFollowerConfiguration";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";

export type PathFollowerEventEmitsOptions = {
  [P in UpdateEvent<keyof PathFollowerConfiguration>]: [PathFollowerConfiguration[ExtractUpdateEvent<P>]?];
};
