import type { JoinCallOptions } from "@/models/message/room/call/JoinCallOptions";

// A fresh object per call — the pre-join sheet edits it in place, so a shared one would carry the previous
// Call's choices into the next lobby
export const getDefaultJoinCallOptions = (): JoinCallOptions => ({ isCameraEnabled: false, isMicrophoneEnabled: true });
