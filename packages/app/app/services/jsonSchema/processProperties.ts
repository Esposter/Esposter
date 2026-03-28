import type { z } from "zod";

import { processOneOf } from "@/services/jsonSchema/processOneOf";
import { processTitle } from "@/services/jsonSchema/processTitle";
import { recurseProperties } from "@/services/jsonSchema/recurseProperties";

export const processProperties = (properties: z.core.JSONSchema.JSONSchema["properties"]) => {
  recurseProperties(properties, {
    otherHooks: [
      (_key, property) => {
        processTitle(property);
        // Support z.union => anyOf
        // We just need to use z.union to define metadata with z.literal which produces anyOf
        // However, vjsf doesn't support anyOf since it can have different values
        // But we know it will always come from the same enum so we can change it to oneOf
        if (property.anyOf) {
          property.oneOf = property.anyOf;
          delete property.anyOf;
        }
        // Support nested discriminated unions (properties that are oneOf rather than type: "object")
        processOneOf(property.oneOf);
      },
    ],
  });
};
