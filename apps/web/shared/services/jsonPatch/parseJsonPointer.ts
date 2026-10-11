import { InvalidOperationError, Operation } from "@esposter/shared";

const INVALID_ESCAPE_REGEX = /~(?![01])/u;
// RFC 6901: the root is the empty pointer, every other one starts with a slash, and a segment unescapes "~1" before
// "~0", so an escaped "~01" reads as "~1" rather than "/"
export const parseJsonPointer = (pointer: string): string[] => {
  if (pointer === "") return [];
  else if (!pointer.startsWith("/") || INVALID_ESCAPE_REGEX.test(pointer))
    throw new InvalidOperationError(Operation.Read, pointer, "not a JSON Pointer");
  return pointer
    .slice(1)
    .split("/")
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
};
