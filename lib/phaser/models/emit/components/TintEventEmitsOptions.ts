import { type TintConfiguration } from "@/lib/phaser/models/configuration/components/TintConfiguration";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";

export type TintEventEmitsOptions = {
  [P in UpdateEvent<keyof TintConfiguration>]: [TintConfiguration[ExtractUpdateEvent<P>]?];
};
