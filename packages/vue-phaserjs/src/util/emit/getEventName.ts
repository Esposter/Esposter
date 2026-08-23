import { EVENT_PREFIX } from "#src/util/emit/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getEventName = (event: string): string => {
  if (!event.startsWith(EVENT_PREFIX) || event.length <= EVENT_PREFIX.length)
    throw new InvalidOperationError(Operation.Read, getEventName.name, event);
  return event.slice(EVENT_PREFIX.length).toLowerCase();
};
