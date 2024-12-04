import type { TweenConfiguration } from "@/models/configuration/global/TweenConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TweenEventEmitsOptions = {
  [P in UpdateEvent<keyof TweenConfiguration>]: [TweenConfiguration[ExtractUpdateEvent<P>]?];
};
