import * as Phaser from "phaser";
import { vi } from "vitest";
// Phaser4-rex-plugins references Phaser as a browser global; expose it for the test environment
vi.stubGlobal("Phaser", Phaser);
