import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import type { Constructor } from "type-fest";

export const getPropertySchema = (type: Constructor<unknown>): JSONSchema<object> | undefined => {
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
