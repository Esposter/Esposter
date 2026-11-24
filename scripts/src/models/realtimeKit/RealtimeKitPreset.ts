// A preset a participant joins with, named for what it lets the participant publish. Camera is never moderated, so
// Every preset allows it
export interface RealtimeKitPreset {
  isMicrophoneAllowed: boolean;
  isScreenshareAllowed: boolean;
  name: string;
}
