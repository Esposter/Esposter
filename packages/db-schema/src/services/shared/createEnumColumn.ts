import { text } from "drizzle-orm/sqlite-core";

// A Postgres enum becomes a text column constrained to the TypeScript enum's values, so its inferred type stays the enum
export const createEnumColumn = <TEnum extends Record<string, string>>(enumObject: TEnum) =>
  text({ enum: Object.values(enumObject) as [TEnum[keyof TEnum], ...TEnum[keyof TEnum][]] });
