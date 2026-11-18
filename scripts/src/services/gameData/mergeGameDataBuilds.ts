import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

// Several builds as one: their notes in order, every record each publishes under its key, and every key each retires
export const mergeGameDataBuilds = (builds: readonly GameDataBuild[]): GameDataBuild => ({
  notes: builds.flatMap(({ notes }) => notes),
  objects: Object.fromEntries(builds.flatMap(({ objects }) => Object.entries(objects))),
  retired: builds.flatMap(({ retired = [] }) => retired),
});
