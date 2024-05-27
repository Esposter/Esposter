import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import type { Constructor } from "type-fest";

export const getPropertySchema = (type: Constructor<unknown>): JSONSchema<never> | null => {
  const commonProperties = {
    title: "Property Value",
    hideDetails: true,
  };

  switch (type) {
    case Boolean:
      return {
        type: "boolean",
        layout: "switch",
        ...commonProperties,
      };
    case String:
      return {
        type: "string",
        ...commonProperties,
      };
    case Number:
      return {
        type: "number",
        ...commonProperties,
      };
    default:
      return null;
  }
};
