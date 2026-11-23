import type { HostedAssetLock } from "hosted-assets";

import gameDataLockJson from "#src/generated/gameDataLock.json";

// The lock as the build holds it: its entries name the objects every reader fetches, and the committed file is the only
// Copy
export const gameDataLock: HostedAssetLock = gameDataLockJson;
