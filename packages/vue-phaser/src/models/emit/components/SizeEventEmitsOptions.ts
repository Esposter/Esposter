import type { SizeConfiguration } from "@/models/configuration/components/SizeConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type SizeEventEmitsOptions = {
  [P in UpdateEvent<keyof SizeConfiguration>]: [SizeConfiguration[ExtractUpdateEvent<P>]?];
};
