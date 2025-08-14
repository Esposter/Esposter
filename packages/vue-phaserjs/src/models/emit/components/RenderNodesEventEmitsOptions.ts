import type { RenderNodesConfiguration } from "@/models/configuration/components/RenderNodesConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type RenderNodesEventEmitsOptions = {
  [P in UpdateEvent<keyof RenderNodesConfiguration>]: [RenderNodesConfiguration[ExtractUpdateEvent<P>]?];
};
