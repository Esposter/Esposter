import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { jsonDateParse } from "@esposter/shared";
import { SuperJSON } from "superjson";

for (const [name, cls] of Object.entries(JSONClassMap))
  SuperJSON.registerCustom(
    {
      deserialize: (data) => new cls(jsonDateParse(data as string)),
      isApplicable: (value): value is InstanceType<typeof cls> => value instanceof cls,
      serialize: (value) => JSON.stringify(value),
    },
    name,
  );

export const transformer = SuperJSON;
