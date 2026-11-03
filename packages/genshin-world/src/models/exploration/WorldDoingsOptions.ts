import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";
import type { Ref } from "vue";

// What the doings are placed and recorded from: the chests, the Oculi, the puzzles' marks, the Seelies at their courts and
// The camps cleared, with the ids the save records of each as done
export interface WorldDoingsOptions {
  clearedCamps: Readonly<Ref<readonly ClearedCamp[]>>;
  foundOculusIds: Readonly<Ref<ReadonlySet<string>>>;
  monumentPlaces: readonly PuzzlePlace[];
  oculusPlaces: Readonly<Ref<readonly OculusPlace[]>>;
  openedChestIds: Readonly<Ref<ReadonlySet<string>>>;
  timeTrialPlaces: readonly PuzzlePlace[];
  worldChestPlaces: Readonly<Ref<readonly ChestPlace[]>>;
}
