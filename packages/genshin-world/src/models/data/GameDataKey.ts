import type gameDataLockJson from "#src/generated/gameDataLock.json";

// Every key the committed lock names a record by, so a reader naming a key no publish wrote fails typecheck
export type GameDataKey = keyof (typeof gameDataLockJson)["objects"];
