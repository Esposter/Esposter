import { camelCase } from "drizzle-orm/pg-core";

export const userSchema = camelCase.schema("user");
