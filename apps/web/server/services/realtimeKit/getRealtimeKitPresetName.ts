import { PublishSource, REALTIMEKIT_PRESET_NAME } from "#server/services/realtimeKit/constants";

export const getRealtimeKitPresetName = (publishSources: PublishSource[]): string => {
  const isMicrophoneAllowed = publishSources.includes(PublishSource.Microphone);
  const isScreenshareAllowed = publishSources.includes(PublishSource.Screenshare);
  if (isMicrophoneAllowed && isScreenshareAllowed) return REALTIMEKIT_PRESET_NAME.CameraMicrophoneScreenshare;
  else if (isMicrophoneAllowed) return REALTIMEKIT_PRESET_NAME.CameraMicrophone;
  else if (isScreenshareAllowed) return REALTIMEKIT_PRESET_NAME.CameraScreenshare;
  else return REALTIMEKIT_PRESET_NAME.Camera;
};
