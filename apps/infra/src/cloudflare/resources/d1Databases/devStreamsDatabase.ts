import CloudflareAccountId from "#src/cloudflare/constants/CloudflareAccountId";
import CloudflareLocationHint from "#src/cloudflare/constants/CloudflareLocationHint";
import * as cloudflare from "@pulumi/cloudflare";

export const devStreamsDatabase: cloudflare.D1Database = new cloudflare.D1Database(
  "d1Database-dev-streams",
  { accountId: CloudflareAccountId, name: "dev-streams", primaryLocationHint: CloudflareLocationHint },
  { protect: true },
);
