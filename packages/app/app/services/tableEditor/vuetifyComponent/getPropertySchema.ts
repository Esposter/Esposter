import type { Class } from "type-fest";
import type { z } from "zod/v4";

export const getPropertySchema = (type: Class<unknown>): undefined | z.core.JSONSchema.BaseSchema => {
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
