import { JSONClasses } from "#shared/services/superjson/JSONClasses";
import { SuperJSON } from "superjson";

for (const { cls, name } of JSONClasses) SuperJSON.registerClass(cls, name);

export const transformer = SuperJSON;
