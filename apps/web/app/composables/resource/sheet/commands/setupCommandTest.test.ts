import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe } from "vitest";

export const setupCommandTest = () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    const sheetHistoryStore = useSheetHistoryStore();
    const { clear } = sheetHistoryStore;
    clear();
  });
};

describe.todo("setupCommandTest");
