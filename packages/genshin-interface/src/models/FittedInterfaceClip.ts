// An interface clip as a screen's fit writes it, its properties plain strings and its keyframes plain arrays in the JSON
export interface FittedInterfaceClip {
  durationMs: number;
  tracks: { keyframes: number[][]; property: string; target: string }[];
}
