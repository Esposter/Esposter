import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldSessionContext } from "#src/models/world/WorldSessionContext";

import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { getServerNow } from "#src/services/time/getServerNow";
import { useWorldSessionStore } from "#src/store/session";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";
import { createPinia, setActivePinia } from "pinia";
import { shallowRef } from "vue";

const getWorldNow = () => getServerNow(0);

// A session store started over a fresh Pinia, the way the session starts it as it mounts, for a suite that tests a
// Feature reading it. The context's data is empty and its clock is the machine's own unless the suite gives its own
export const startTestWorldSession = (
  overrides: Partial<WorldSessionContext> = {},
  savedBag: { inventory: Inventory; wallet: Wallet } = {
    inventory: { ...EMPTY_INVENTORY },
    wallet: { ...EMPTY_WALLET },
  },
) => {
  setActivePinia(createPinia());
  const worldSessionStore = useWorldSessionStore();
  worldSessionStore.start(
    {
      gameDataBaseUrl: "",
      gameText: ENGLISH_GAME_TEXT,
      getWorldNow,
      language: GameLanguage.English,
      materialDataMap: new Map(),
      nameText: {},
      worldNow: shallowRef(getWorldNow()),
      ...overrides,
    },
    savedBag,
  );
  return worldSessionStore;
};
