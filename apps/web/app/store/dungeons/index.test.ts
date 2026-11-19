import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { describe, vi } from "vitest";

// The dungeons store with its save and scene switch stubbed, the one double every suite that mocks the store reads
// Its spies and state are per suite, since each test file gets a fresh module
const dungeonsStore = reactive({
  dungeons: new Dungeons(),
  fadeSwitchToScene: vi.fn<() => void>(),
  save: new Save(),
  saveDungeons: vi.fn<() => void>(),
});

export const useDungeonsStore = () => dungeonsStore;

describe.todo("useDungeonsStore");
