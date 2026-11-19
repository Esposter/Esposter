// The threshold prefilter the bloom chain opens with: one tap per pixel, or four taps averaged before the threshold
export const GameBloomPrefilter = { FourTap: "fourTap", OneTap: "oneTap" } as const;
export type GameBloomPrefilter = (typeof GameBloomPrefilter)[keyof typeof GameBloomPrefilter];
