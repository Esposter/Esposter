import type { CabMap } from "#src/models/recreation/animeStudio/CabMap";

import { encodeInt32 } from "#src/services/recreation/animeStudio/encodeInt32";
import { encodeInt64 } from "#src/services/recreation/animeStudio/encodeInt64";
import { encodeString } from "#src/services/recreation/animeStudio/encodeString";

// The bytes of a CAB map in the form AnimeStudio writes and `readCabMap` reads back
export const writeCabMap = ({ baseFolder, records }: CabMap): Buffer =>
  Buffer.concat([
    encodeString(baseFolder),
    encodeInt32(records.length),
    ...records.flatMap(({ block, dependencies, name, offset }) => [
      encodeString(name),
      encodeString(block),
      encodeInt64(offset),
      encodeInt32(dependencies.length),
      ...dependencies.map((dependency) => encodeString(dependency)),
    ]),
  ]);
