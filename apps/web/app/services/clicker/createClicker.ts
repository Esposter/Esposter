import type { Clicker } from "#shared/models/clicker/data/Clicker";

import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { toClicker } from "#src/services/clicker/save/toClicker";

// The game a player starts with, which is the game an empty save resolves to, with any field the caller sets over it
export const createClicker = (init?: Partial<Clicker>): Clicker => ({ ...toClicker(new ClickerSave()), ...init });
