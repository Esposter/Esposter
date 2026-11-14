// What the page sends the microphone gate on the audio thread each time one of them changes
export interface MicrophoneGateSettings {
  inputSensitivityDecibels: number;
  isPushToTalk: boolean;
  isPushToTalkKeyHeld: boolean;
  microphoneVolumePercentage: number;
}
