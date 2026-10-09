import type gameDataLockJson from "#src/generated/gameDataLock.json";

// Every index the committed lock names, so a reader naming an index no publish wrote fails typecheck
export type GameDataIndexKey = keyof (typeof gameDataLockJson)["indexes"];
