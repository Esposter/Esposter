import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type NineSliceEventEmitsOptions = {
  [P in UpdateEvent<keyof NineSliceConfiguration>]: [NineSliceConfiguration[ExtractUpdateEvent<P>]?];
};
