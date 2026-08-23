import type { ExtractUpdateEvent } from "#src/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "#src/util/types/UpdateEvent";

export type EmitsOptionsFor<TConfiguration extends object> = {
  [P in UpdateEvent<keyof TConfiguration & string>]: [TConfiguration[ExtractUpdateEvent<P> & keyof TConfiguration]?];
};
