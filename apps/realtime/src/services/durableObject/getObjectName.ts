import { NotInitializedError } from "@esposter/shared";

// A named object is named for the one thing it holds, its room, its person or its call session, so the name is that id.
// An object reached without a name was not made by the Worker that serves it
export const getObjectName = ({ id }: DurableObjectState, className: string): string => {
  if (id.name === undefined) throw new NotInitializedError(className);
  return id.name;
};
