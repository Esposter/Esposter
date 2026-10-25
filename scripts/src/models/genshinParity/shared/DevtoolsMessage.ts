import type { StallRenderer } from "#src/models/genshinParity/shared/StallRenderer";

export interface DevtoolsMessage {
  data: { renderer: { instance?: StallRenderer; value?: { instance?: StallRenderer } }; scene?: { value?: unknown } };
  type: string;
}
