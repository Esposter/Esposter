// A remote participant sends sound from two sources, their microphone and their screen share, and each is played
// From its own element
export const RemoteAudioSource = { Microphone: "microphone", ScreenShare: "screenShare" } as const;
export type RemoteAudioSource = (typeof RemoteAudioSource)[keyof typeof RemoteAudioSource];
