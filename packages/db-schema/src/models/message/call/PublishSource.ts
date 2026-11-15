// What a moderator takes away from a participant and gives back: the microphone, and the screenshare with its audio.
// Camera is never moderated, so every preset allows it
export const PublishSource = { Microphone: "microphone", Screenshare: "screenshare" } as const;
export type PublishSource = (typeof PublishSource)[keyof typeof PublishSource];
