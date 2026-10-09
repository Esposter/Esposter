import type { FrameSample } from "#src/models/genshinParity/shared/FrameSample";

// One state's frames as the trace names them, with the state's name and its summary
export interface TracedState {
  frames: FrameSample[];
  name: string;
}
