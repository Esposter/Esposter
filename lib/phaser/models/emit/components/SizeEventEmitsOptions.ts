import { type SizeConfiguration } from "@/lib/phaser/models/configuration/components/SizeConfiguration";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";

export type SizeEventEmitsOptions = {
  [P in UpdateEvent<keyof SizeConfiguration>]: [SizeConfiguration[ExtractUpdateEvent<P>]?];
};
