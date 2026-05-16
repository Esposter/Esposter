import { Room } from "livekit-client";

export const readDevices = (kind: MediaDeviceKind) => Room.getLocalDevices(kind);
