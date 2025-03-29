import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { SuperJSON } from "superjson";

for (const [name, cls] of Object.entries(JSONClassMap)) SuperJSON.registerClass(cls, name);

export const transformer = SuperJSON;
