import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";
import type { NineSliceConfiguration } from "~/lib/phaser/models/configuration/NineSliceConfiguration";

export type NineSliceEventEmitsOptions = {
  [P in UpdateEvent<keyof NineSliceConfiguration>]: [NineSliceConfiguration[ExtractUpdateEvent<P>]?];
};
