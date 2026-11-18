import type { EmitterSettings } from "#src/models/genshinAssets/particles/EmitterSettings";
import type { ParticleSystemLayout } from "#src/models/genshinAssets/particles/ParticleSystemLayout";

import { readEmitterConstant } from "#src/services/genshinAssets/particles/readEmitterConstant";

// A particle system's settings read from its raw serialized bytes at the offsets the layout places each field, each of
// Which is named as not held when the layout does not place it
export const readEmitterSettings = (bytes: Buffer, layout: ParticleSystemLayout): EmitterSettings => ({
  colour: readEmitterConstant(bytes, layout.colour, (read): [number, number, number, number] => [
    read(0),
    read(1),
    read(2),
    read(3),
  ]),
  life: readEmitterConstant(bytes, layout.life, (read) => read(0)),
  rate: readEmitterConstant(bytes, layout.rate, (read) => read(0)),
  size: readEmitterConstant(bytes, layout.size, (read) => read(0)),
});
