import { getJSONClass, getJSONClasses, JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { jsonDateParse } from "@esposter/shared";
import { SuperJSON } from "superjson";

// SuperJSON keys its custom transformers by name, so a hot reload registering them again replaces each one
for (const name of Object.keys(JSONClassMap))
  SuperJSON.registerCustom(
    {
      deserialize: (data) => new (getJSONClass(name))(jsonDateParse(data as string)),
      isApplicable: (value) => getJSONClasses(name).some((jsonClass) => value instanceof jsonClass),
      serialize: (value) => JSON.stringify(value),
    },
    name,
  );

export const transformer = SuperJSON;
