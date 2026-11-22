import type { EnabledMods } from "../../types";

import { ModNames } from "../models/ModName";
import { checkIsObject } from "./checkIsObject";

// The mods' switches as the store holds them: each one a boolean where it is set, so a stored record holding anything
// Else in one reads as holding none
export const checkIsEnabledMods = (value: unknown): value is Partial<EnabledMods> =>
  checkIsObject(value) && ModNames.every((name) => value[name] === undefined || typeof value[name] === "boolean");
