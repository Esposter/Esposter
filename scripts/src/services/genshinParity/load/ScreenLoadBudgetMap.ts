import type { LoadBudget } from "#src/models/genshinParity/LoadBudget";

// Each screen's load budget, written at its measured figures plus a tenth on the machine named, so `load` fails a screen
// That grows past what it loaded when its budget was written
export const ScreenLoadBudgetMap: Record<string, LoadBudget> = {
  GameOpening: {
    gameDataBytes: 2559181,
    geometries: 0,
    machine: "DESKTOP-B9KPH2V",
    objects: 0,
    programs: 0,
    readyMs: 1158,
    requests: 47,
    textures: 0,
  },
  LoginScreen: {
    gameDataBytes: 2559181,
    geometries: 28,
    machine: "DESKTOP-B9KPH2V",
    objects: 57,
    programs: 33,
    readyMs: 6042,
    requests: 71,
    textures: 36,
  },
  WorldScreen: {
    gameDataBytes: 4444324,
    geometries: 242,
    machine: "DESKTOP-B9KPH2V",
    objects: 322,
    programs: 107,
    readyMs: 13610,
    requests: 95,
    textures: 39,
  },
};
