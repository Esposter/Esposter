import type * as pulumi from "@pulumi/pulumi";

import { devTokEsposterRealtimekit } from "#src/cloudflare/resources/accountTokens/devTokEsposterRealtimekit";

// The dev realtime Worker's RealtimeKit token, written to ESC for the Worker secret and for realtimekit:provision
export const devRealtimeKitApiToken: pulumi.Output<string> = devTokEsposterRealtimekit.value;
