import { useUserStore } from "@/store/user";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, test } from "vitest";

describe("User Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("initialises", () => {
    useUserStore();
  });
});
