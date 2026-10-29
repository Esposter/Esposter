import type { GenshinDevSaveCommandsOptions } from "@/models/genshin/dev/GenshinDevSaveCommandsOptions";
import type { DevCommand, DevOutcome, DevSaveOutcome, DevSaveTables } from "genshin-world";

import {
  giveItem,
  giveItemArgumentsSchema,
  readDevSaveTables,
  setAdventureRank,
  setAdventureRankArgumentsSchema,
  setCharacterLevel,
  setCharacterLevelArgumentsSchema,
  unlockLandmark,
  unlockLandmarkArgumentsSchema,
} from "genshin-world";
import { getResultAsync } from "@esposter/shared";

// The developer's save commands, `give`, `level`, `ar` and `unlock`, registered once the game's names and rules are read.
// Each reads the save the world last wrote, writes the save field the game's own act writes and hands the new save to the
// Page, which applies it. A refused line writes nothing
export const useGenshinDevSaveCommands = ({
  applySave,
  devRegistry,
  gameDataBaseUrl,
  gameText,
  getSave,
  language,
  regionDataBaseUrl,
}: GenshinDevSaveCommandsOptions) => {
  let isActive = true;
  let unregister: (() => void) | undefined;

  const createCommands = (tables: DevSaveTables): DevCommand[] => {
    const takeOutcome = (outcome: DevSaveOutcome): DevOutcome => {
      if (!outcome.ok) return outcome;

      applySave(outcome.save);
      return { ok: true, value: outcome.value };
    };
    // Each command is typed by its own schema, so its `run` takes the arguments that schema parses rather than the list's
    const giveCommand: DevCommand<typeof giveItemArgumentsSchema> = {
      args: giveItemArgumentsSchema,
      name: "give",
      run: (args) => takeOutcome(giveItem(getSave(), args, tables)),
    };
    const levelCommand: DevCommand<typeof setCharacterLevelArgumentsSchema> = {
      args: setCharacterLevelArgumentsSchema,
      name: "level",
      run: (args) => takeOutcome(setCharacterLevel(getSave(), args, tables)),
    };
    const adventureRankCommand: DevCommand<typeof setAdventureRankArgumentsSchema> = {
      args: setAdventureRankArgumentsSchema,
      name: "ar",
      run: (args) => takeOutcome(setAdventureRank(getSave(), args, tables)),
    };
    const unlockCommand: DevCommand<typeof unlockLandmarkArgumentsSchema> = {
      args: unlockLandmarkArgumentsSchema,
      name: "unlock",
      run: (args) => takeOutcome(unlockLandmark(getSave(), args, tables)),
    };
    return [giveCommand, levelCommand, adventureRankCommand, unlockCommand];
  };

  // The read settles every failure itself, logging it, so the chain it returns cannot reject and nothing waits on it
  onMounted(() => {
    getResultAsync(() => readDevSaveTables(gameDataBaseUrl, regionDataBaseUrl, language, gameText)).match((tables) => {
      if (!isActive) return;

      unregister = devRegistry.register({ commands: createCommands(tables), variables: [] });
    }, console.error);
  });
  onUnmounted(() => {
    isActive = false;
    unregister?.();
  });
};
