import { SuperJSON } from "#shared/services/superjson";
import { uneval } from "devalue";

export const transformer = {
  input: SuperJSON,
  output: {
    // This `eval` only ever happens on the **client**
    deserialize: (object: unknown) => eval(`(${object})`),
    serialize: (object: unknown) => uneval(object),
  },
};
