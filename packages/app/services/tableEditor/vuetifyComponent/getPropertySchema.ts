import type { JSONSchema } from "@/models/jsonSchema/JSONSchema";
import type { Constructor } from "type-fest";

export const getPropertySchema = (type: Constructor<unknown>): JSONSchema | null => {
  const title = "Property Value";

  switch (type) {
    case Boolean:
      return {
        type: "object",
        properties: {
          switch: {
            type: "boolean",
            title,
            layout: "switch",
            hideDetails: true,
          },
        },
      };
    case String:
      return {
        type: "object",
        properties: {
          switch: {
            type: "string",
            title,
            layout: "switch",
          },
        },
      };
    case Number:
      return {
        type: "object",
        properties: {
          num: {
            type: "number",
            title,
          },
        },
      };
    default:
      return null;
  }
};
