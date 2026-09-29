import { camelCase } from "drizzle-orm/pg-core";

export const appSchema = camelCase.schema("app");
