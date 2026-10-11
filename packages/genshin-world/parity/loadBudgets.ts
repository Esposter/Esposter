import type { LoadBudget } from "#parity/models/LoadBudget";

// Each screen's load budget, written at its measured figures plus a tenth on the machine named, so `load` fails a screen
// That grows past what it loaded when its budget was written
export const ScreenLoadBudgetMap: Record<string, LoadBudget> = {
  GameOpening: {
    gameDataBytes: 2559181,
    geometries: 0,
    machine: "DESKTOP-B9KPH2V",
    objects: 0,
    programs: 0,
    readyMs: 2163,
    requests: 1878,
    textures: 0,
  },
  LoginScreen: {
    gameDataBytes: 2559181,
    geometries: 28,
    machine: "DESKTOP-B9KPH2V",
    objects: 57,
    programs: 33,
    readyMs: 7124,
    requests: 1902,
    textures: 36,
  },
  WorldScreen: {
    gameDataBytes: 4444324,
    geometries: 303,
    machine: "DESKTOP-B9KPH2V",
    objects: 343,
    programs: 130,
    readyMs: 25543,
    requests: 2819,
    textures: 43,
  },
};
