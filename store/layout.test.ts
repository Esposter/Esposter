import { useLayoutStore } from "@/store/layout";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("Layout Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("initialises", () => {
    expect(() => useLayoutStore()).toThrowError("composables must be called from inside a setup function");
  });
});
