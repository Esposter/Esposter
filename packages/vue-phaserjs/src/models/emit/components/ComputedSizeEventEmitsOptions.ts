import type { ComputedSizeConfiguration } from "@/models/configuration/components/ComputedSizeConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ComputedSizeEventEmitsOptions = {
  [P in UpdateEvent<keyof ComputedSizeConfiguration>]: [ComputedSizeConfiguration[ExtractUpdateEvent<P>]?];
};
