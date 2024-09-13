import type { TweenConfiguration } from "@/models/configuration/global/TweenConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type TweenEventEmitsOptions = {
  [P in UpdateEvent<keyof TweenConfiguration>]: [TweenConfiguration[ExtractUpdateEvent<P>]?];
};
