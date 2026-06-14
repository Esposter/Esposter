import * as Phaser from "phaser";
import { afterAll, beforeAll, vi } from "vitest";

beforeAll(() => {
  // Phaser4-rex-plugins references Phaser as a browser global; expose it for the test environment
  vi.stubGlobal("Phaser", Phaser);
});

afterAll(() => {
  vi.unstubAllGlobals();
});
