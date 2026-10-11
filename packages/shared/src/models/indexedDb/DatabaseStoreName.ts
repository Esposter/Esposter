import type { DatabaseSchema } from "#src/models/indexedDb/DatabaseSchema";

// A schema that extends DatabaseSchema also inherits its string index, which would make every name a store, so only the
// Literal keys count. A schema with none, the untyped default, takes any name
type LiteralKeys<TSchema> = keyof { [TKey in keyof TSchema as string extends TKey ? never : TKey]: TKey } & string;

export type DatabaseStoreName<TSchema extends DatabaseSchema> = [LiteralKeys<TSchema>] extends [never]
  ? string
  : LiteralKeys<TSchema>;
