import type * as pulumi from "@pulumi/pulumi";

import { prodTokEsposterR2 } from "#src/cloudflare/resources/accountTokens/prodTokEsposterR2";

// The prod R2 publishers' S3 access key id: the token's id, which Cloudflare derives the key pair from
export const prodR2AccessKeyId: pulumi.Output<string> = prodTokEsposterR2.id;
