import type { HostedAssetLock } from "hosted-assets";

import gameDataLockJson from "#src/generated/gameDataLock.json";

// The lock as the build holds it: its entries name the objects every reader fetches, and the committed file is the
// Only copy of it
export const gameDataLock: HostedAssetLock = gameDataLockJson;
