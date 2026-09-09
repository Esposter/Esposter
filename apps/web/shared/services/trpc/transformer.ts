import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { jsonDateParse } from "@esposter/shared";
import { SuperJSON } from "superjson";

for (const [name, entityClass] of Object.entries(JSONClassMap))
  SuperJSON.registerCustom(
    {
      deserialize: (data) => new entityClass(jsonDateParse(data as string)),
      isApplicable: (value): value is InstanceType<typeof entityClass> => value instanceof entityClass,
      serialize: (value) => JSON.stringify(value),
    },
    name,
  );

export const transformer = SuperJSON;
