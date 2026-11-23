import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { Save } from "#shared/models/dungeons/data/Save";
import { describe, vi } from "vitest";

// The dungeons store with its save and scene switch stubbed, the one double every suite that mocks the store reads
// Its spies and state are per suite, since each test file gets a fresh module. The state is held in refs, as the store
// Holds it, so a suite reads it through `storeToRefs` the way it reads the real store
// A test double's module is loaded
// oxlint-disable-next-line selector-ban/no-restricted-syntax -- fresh per test file, so no request or caller shares it
const dungeonsStore = reactive({
  dungeons: ref(new Dungeons()),
  fadeSwitchToScene: vi.fn<() => void>(),
  save: ref(new Save()),
  saveDungeons: vi.fn<() => void>(),
});

export const useDungeonsStore = () => dungeonsStore;

describe.todo("useDungeonsStore");
