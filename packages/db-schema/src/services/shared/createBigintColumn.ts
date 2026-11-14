import { customType } from "drizzle-orm/sqlite-core";

// SQLite has no bigint column that drizzle reads back as a bigint, so this is an integer column converted at the driver
// boundary. The round trip is exact only up to 2^53, so a bitfield stored here must stay below bit 53
export const createBigintColumn = () =>
  customType<{ data: bigint; driverData: number }>({
    dataType: () => "integer",
    fromDriver: (value) => BigInt(value),
    toDriver: (value) => Number(value),
  })();
