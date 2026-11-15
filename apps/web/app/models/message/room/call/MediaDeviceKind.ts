export const MediaDeviceKind = {
  Audioinput: "audioinput",
  Audiooutput: "audiooutput",
  Videoinput: "videoinput",
} as const;
export type MediaDeviceKind = (typeof MediaDeviceKind)[keyof typeof MediaDeviceKind];
