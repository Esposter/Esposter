import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type EmitsOptionsFor<TConfiguration extends object> = {
  [P in UpdateEvent<keyof TConfiguration & string>]: [TConfiguration[ExtractUpdateEvent<P> & keyof TConfiguration]?];
};
