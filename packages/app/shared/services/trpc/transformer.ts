import { JSONClasses } from "#shared/services/superjson/JSONClasses";
import { SuperJSON } from "superjson";

for (const { cls } of JSONClasses) SuperJSON.registerClass(cls);

export const transformer = SuperJSON;
