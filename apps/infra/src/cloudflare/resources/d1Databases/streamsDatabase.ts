import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const streamsDatabase: cloudflare.D1Database = new cloudflare.D1Database(
  "d1Database-streams",
  { accountId: CloudflareAccountId, name: "streams", primaryLocationHint: CloudflareLocationHint },
  { protect: true },
);
