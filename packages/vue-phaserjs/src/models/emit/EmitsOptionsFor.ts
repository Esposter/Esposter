import type { ExtractUpdateEvent } from "#src/models/emit/ExtractUpdateEvent";
import type { UpdateEvent } from "#src/models/emit/UpdateEvent";

export type EmitsOptionsFor<TConfiguration extends object> = {
  [P in UpdateEvent<keyof TConfiguration & string>]: [TConfiguration[ExtractUpdateEvent<P> & keyof TConfiguration]?];
};
