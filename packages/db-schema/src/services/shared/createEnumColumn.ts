import { text } from "drizzle-orm/sqlite-core";

// An enum becomes a text column constrained to the TypeScript enum's values, so its inferred type stays the enum
export const createEnumColumn = <TEnum extends Record<string, string>>(enumObject: TEnum) =>
  /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.values types the values as a plain array,
     but an enum is closed and has members, and the column takes its values as a non-empty tuple */
  text({ enum: Object.values(enumObject) as [TEnum[keyof TEnum], ...TEnum[keyof TEnum][]] });
