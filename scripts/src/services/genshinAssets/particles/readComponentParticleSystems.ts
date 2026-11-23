/* oxlint-disable no-await-in-loop -- One device: AnimeStudio reads one block at a time, each run blocking the
   thread; Bounded concurrency: one particle system file is open at a time, since the blocks hold more than the
   descriptors a process may open at once */
import type { ParticleSystemEmitter } from "#src/models/genshinAssets/particles/ParticleSystemEmitter";
import type { ParticleSystemLayout } from "#src/models/genshinAssets/particles/ParticleSystemLayout";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readEmitterSettings } from "#src/services/genshinAssets/particles/readEmitterSettings";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentLayoutBlocks } from "#src/services/genshinAssets/shared/readComponentLayoutBlocks";
import { readSerializedGameObject } from "#src/services/genshinAssets/shared/readSerializedGameObject";
import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { existsSync } from "node:fs";
import { readdir, readFile, rm } from "node:fs/promises";
import { basename, join } from "node:path";

// Where each field of a particle system sits in its bytes is not held: the export names none, since AnimeStudio's JSON
// Of one is `{ "Name": "" }`, and no layout of its serialized fields has been checked against a system whose settings
// Are known. Until one is, every field is named as not held rather than read from a guessed offset
const PARTICLE_SYSTEM_LAYOUT: ParticleSystemLayout = {};
// Every particle system of a component's layout blocks exported raw, per file, and read for its rate, life, size and
// Colour as its layout places them. Its game object is its leading pointer, resolved through its file's references and
// Named by the layout. Only the particle systems on game objects whose names match are returned when a pattern is given
export const readComponentParticleSystems = async (
  component: DerivedAssetComponent,
  objectPattern?: RegExp,
): Promise<ParticleSystemEmitter[]> => {
  const directory = getComponentDirectory(component);
  const { blocks, cabMap, objectNameMap } = await readComponentLayoutBlocks(directory.layout);
  await rm(directory.particles, { force: true, recursive: true });
  for (const block of blocks)
    await exportBlockBySource(block, [AssetType.ParticleSystem], AnimeStudioExportType.Raw, directory.particles);
  const emitters: ParticleSystemEmitter[] = [];
  for (const block of blocks) {
    const typeDirectory = join(directory.particles, basename(block, ".blk"), AssetType.ParticleSystem);
    if (!existsSync(typeDirectory)) continue;
    for (const file of await readdir(typeDirectory))
      for (const name of await readdir(join(typeDirectory, file))) {
        const bytes = await readFile(join(typeDirectory, file, name));
        const gameObject = readSerializedGameObject(bytes, `${AssetType.ParticleSystem} ${name} in ${file}`);
        const resolved = resolveObjectPointer(cabMap, file, gameObject);
        const owner = resolved ? (objectNameMap.get(toObjectKey(resolved.file, resolved.pathId)) ?? "") : "";
        if (!objectPattern || objectPattern.test(owner))
          emitters.push({ block, file, owner, settings: readEmitterSettings(bytes, PARTICLE_SYSTEM_LAYOUT) });
      }
  }
  return emitters;
};
