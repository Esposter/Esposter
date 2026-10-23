import { getJSONClass, JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { jsonDateParse } from "@esposter/shared";
import { SuperJSON } from "superjson";

// A hot reload re-evaluates this module on the same SuperJSON instance, so registering again would stack duplicate
// Transformers, and the first of them to match would be the one holding the classes from before the reload
const REGISTERED_KEY = Symbol.for("jsonClassesRegistered");

if (!Object.hasOwn(globalThis, REGISTERED_KEY)) {
  for (const name of Object.keys(JSONClassMap))
    SuperJSON.registerCustom(
      {
        deserialize: (data) => new (getJSONClass(name))(jsonDateParse(data as string)),
        isApplicable: (value) => value instanceof getJSONClass(name),
        serialize: (value) => JSON.stringify(value),
      },
      name,
    );

  Object.assign(globalThis, { [REGISTERED_KEY]: true });
}

export const transformer = SuperJSON;
