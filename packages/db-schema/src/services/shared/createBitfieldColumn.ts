import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/sqlite-core";

// A permission bitfield is stored as its decimal text. D1 hands an integer back as a JS number, which is exact only up
// To 2^53, so a bit past that would read back as another value; the text reads back exact at any width. Every bitwise
// Operation on it happens in JS on bigints, never in SQL, so nothing depends on how SQLite converts the text. The
// Default is written as SQL because drizzle-kit cannot render a bigint default for a custom column
export const createBitfieldColumn = () =>
  customType<{ data: bigint; driverData: string }>({
    dataType: () => "text",
    fromDriver: BigInt,
    toDriver: (value) => value.toString(),
  })()
    .notNull()
    .default(sql`'0'`);
