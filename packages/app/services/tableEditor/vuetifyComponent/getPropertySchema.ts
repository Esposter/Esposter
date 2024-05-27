import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import type { Constructor } from "type-fest";

export const getPropertySchema = (type: Constructor<unknown>): JSONSchema<never> | null => {
  switch (type) {
    case Boolean:
      return {
        type: "boolean",
        title: "True",
      };
    case String:
      return {
        type: "string",
        title: "Value",
      };
    case Number:
      return {
        type: "number",
        title: "Value",
      };
    default:
      return null;
  }
};
