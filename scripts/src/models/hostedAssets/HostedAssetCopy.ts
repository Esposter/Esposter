import type { CloudflareEnvironment } from "@esposter/db-schema";
import type { HostedAssetName } from "hosted-assets";

// One object or index a repair copies: its name, the length its lock records when the lock records one (an entry an
// Index Names has none), and the environment whose bucket holds it and the one whose bucket lacks it
export interface HostedAssetCopy {
  bytes?: number | undefined;
  destination: CloudflareEnvironment;
  name: HostedAssetName;
  source: CloudflareEnvironment;
}
