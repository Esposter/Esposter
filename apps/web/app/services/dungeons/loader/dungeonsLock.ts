import type { HostedAssetLock } from "hosted-assets";

import dungeonsLockJson from "#shared/generated/hostedAssets/dungeonsLock.json";

// The lock as the build holds it: each entry names an object the game reads, and its url is built from that entry. The
// Committed file is the only copy of it
export const dungeonsLock: HostedAssetLock = dungeonsLockJson;
