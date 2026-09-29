import { camelCase } from "drizzle-orm/pg-core";

export const messageSchema = camelCase.schema("message");
