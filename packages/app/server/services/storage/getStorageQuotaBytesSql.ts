import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { users } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// The tier -> quota map, expressed in SQL so the reserve's conditional UPDATE can read a user's own limit
// Inside the same statement that increments their counter — resolving it in JS first would mean reading the
// Tier, then updating, and a check that is not part of the write is not a compare-and-swap.
// Cast to text because the parameter carrying each tier name is untyped; the quota is a constant of ours,
// So it is inlined rather than bound, which keeps the CASE arms free of parameter-type inference.
// A tier with no arm yields NULL, and `<= NULL` is never true — an unmapped tier rejects rather than passes.
export const getStorageQuotaBytesSql = () =>
  sql`CASE ${users.storageTier}::text ${sql.join(
    Object.entries(StorageTierQuotaMap).map(
      ([storageTier, quotaBytes]) => sql`WHEN ${storageTier} THEN ${sql.raw(quotaBytes.toString())}`,
    ),
    sql` `,
  )} END`;
