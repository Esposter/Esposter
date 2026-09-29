import { camelCase } from "drizzle-orm/pg-core";

export const authSchema = camelCase.schema("auth");
