import { InvalidOperationError, Operation } from "@esposter/shared";

const prefix = "on";

export const getEventName = (event: string): string => {
  if (!event.startsWith(prefix) || event.length <= prefix.length)
    throw new InvalidOperationError(Operation.Read, getEventName.name, event);
  return event.slice(prefix.length).toLowerCase();
};
