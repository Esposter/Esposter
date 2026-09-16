import type { MapValue } from "#src/util/types/MapValue";

import { MockContainerDatabase } from "#src/store/MockContainerDatabase";
import { getOrCreate } from "@esposter/shared";

export const getMockContainer = (containerName: string): MapValue<typeof MockContainerDatabase> =>
  getOrCreate(MockContainerDatabase, containerName, () => new Map());
