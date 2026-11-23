import type * as pulumi from "@pulumi/pulumi";

import { prodTokEsposterR2 } from "#src/cloudflare/resources/accountTokens/prodTokEsposterR2";
import { getR2SecretAccessKey } from "#src/cloudflare/services/getR2SecretAccessKey";

// The prod R2 publishers' S3 secret access key: the digest of the token's value, which is a secret output
export const prodR2SecretAccessKey: pulumi.Output<string> = prodTokEsposterR2.value.apply(getR2SecretAccessKey);
