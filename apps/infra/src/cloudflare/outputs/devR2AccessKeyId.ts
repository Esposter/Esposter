import type * as pulumi from "@pulumi/pulumi";

import { devTokEsposterR2 } from "#src/cloudflare/resources/accountTokens/devTokEsposterR2";

// The dev R2 publishers' S3 access key id: the token's id, which Cloudflare derives the key pair from
export const devR2AccessKeyId: pulumi.Output<string> = devTokEsposterR2.id;
