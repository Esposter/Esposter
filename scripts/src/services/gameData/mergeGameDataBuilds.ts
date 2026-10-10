import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

// Several builds as one: their notes in order, and every record each publishes under its key
export const mergeGameDataBuilds = (builds: readonly GameDataBuild[]): GameDataBuild => ({
  notes: builds.flatMap(({ notes }) => notes),
  objects: Object.fromEntries(builds.flatMap(({ objects }) => Object.entries(objects))),
});
