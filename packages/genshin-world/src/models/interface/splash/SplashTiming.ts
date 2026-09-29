// How one splash comes and goes on the white: it fades in, holds, fades out, and the white alone then holds before
// The next one starts
export interface SplashTiming {
  fadeInEasing: string;
  fadeInMs: number;
  fadeOutEasing: string;
  fadeOutMs: number;
  holdMs: number;
  whiteAfterMs: number;
}
