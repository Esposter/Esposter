import type { VirtualBackgroundPick } from "#src/models/message/room/realtime/VirtualBackgroundPick";

// What a run built and did not keep: its transformer, released as the run scope hands it back
export const releaseVirtualBackgroundPick = (pick: undefined | VirtualBackgroundPick) => {
  pick?.createdTransformer?.destruct();
};
