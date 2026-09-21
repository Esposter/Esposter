import { VOICE_MODEL_ID } from "#src/services/constants";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// The runtime lays a checkpoint down under the owner and the repository of the id it was asked for, and sweeps
// Nothing it is no longer asked for, so a change of model otherwise strands the old weights — gigabytes of them —
// On every machine that had loaded them. Nothing here can ask for a checkpoint the id no longer names, so the cache
// Carries the one in use and nothing else, swept where the one in use is about to land
export const deleteSupersededModels = (modelsDirectory: string): void => {
  if (!existsSync(modelsDirectory)) return;

  const [currentOwner, currentRepository] = VOICE_MODEL_ID.split("/");
  for (const owner of readdirSync(modelsDirectory)) {
    const ownerDirectory = join(modelsDirectory, owner);
    if (owner !== currentOwner) {
      rmSync(ownerDirectory, { force: true, recursive: true });
      continue;
    }

    for (const repository of readdirSync(ownerDirectory))
      if (repository !== currentRepository) rmSync(join(ownerDirectory, repository), { force: true, recursive: true });
  }
};
