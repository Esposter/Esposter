import type { IsoTriangleConfiguration } from "@/models/configuration/IsoTriangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type IsoTriangleEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof IsoTriangleConfiguration>]: [IsoTriangleConfiguration[ExtractUpdateEvent<P>]?];
};
