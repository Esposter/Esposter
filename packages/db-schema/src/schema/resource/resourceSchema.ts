import { camelCase } from "drizzle-orm/pg-core";

export const resourceSchema = camelCase.schema("resource");
