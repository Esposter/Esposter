import type * as pulumi from "@pulumi/pulumi";

import { prodTokEsposterRealtimekit } from "#src/cloudflare/resources/accountTokens/prodTokEsposterRealtimekit";

// The prod realtime Worker's RealtimeKit token, written to ESC for the Worker secret and for realtimekit:provision
export const prodRealtimeKitApiToken: pulumi.Output<string> = prodTokEsposterRealtimekit.value;
