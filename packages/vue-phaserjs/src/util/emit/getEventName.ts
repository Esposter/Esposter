import { InvalidOperationError, Operation } from "@esposter/shared";

export const getEventName = (event: string): string => {
  const [, eventName] = event.split("on");
  if (!eventName) throw new InvalidOperationError(Operation.Read, getEventName.name, event);
  return eventName.toLowerCase();
};
