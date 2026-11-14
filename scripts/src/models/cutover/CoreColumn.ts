// A column as the D1 schema declares it. `dataType` is drizzle's own tag: `object date` for a millisecond timestamp, `boolean`,
// `object json`, `custom` for the bigint bitfield, `number int53`, `number` for a real, and `string` or `string enum` for text
export interface CoreColumn {
  dataType: string;
  name: string;
  notNull: boolean;
}
