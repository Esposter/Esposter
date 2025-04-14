import type { Class } from "type-fest";
import type { core } from "zod";

export const getPropertySchema = (type: Class<unknown>): core.JSONSchema.BaseSchema | undefined => {
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
