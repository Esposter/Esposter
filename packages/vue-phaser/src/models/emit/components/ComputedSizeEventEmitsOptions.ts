import type { ComputedSizeConfiguration } from "@/models/configuration/components/ComputedSizeConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type ComputedSizeEventEmitsOptions = {
  [P in UpdateEvent<keyof ComputedSizeConfiguration>]: [ComputedSizeConfiguration[ExtractUpdateEvent<P>]?];
};
