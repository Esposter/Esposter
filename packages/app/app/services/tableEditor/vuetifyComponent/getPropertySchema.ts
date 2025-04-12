import type { JsonSchema } from "arktype";
import type { Class } from "type-fest";

export const getPropertySchema = (type: Class<unknown>): JsonSchema | undefined => {
  switch (type) {
    case Boolean:
      return {
        title: "True",
        type: "boolean",
      };
    case Number:
      return {
        title: "Value",
        type: "number",
      };
    case String:
      return {
        title: "Value",
        type: "string",
      };
    default:
      return undefined;
  }
};
