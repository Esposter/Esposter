/* eslint-disable vitest/require-top-level-describe */
import { useFileHistoryStore } from "@/store/resource/file/history";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe } from "vitest";

export const setupCommandTest = () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });
};

describe.todo("setupCommandTest");
