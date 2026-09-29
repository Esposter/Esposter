import { camelCase } from "drizzle-orm/pg-core";

export const postSchema = camelCase.schema("post");
