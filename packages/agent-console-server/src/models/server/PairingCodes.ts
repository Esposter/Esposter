export interface PairingCodes {
  add: (code: string, durationMs: number) => void;
  clear: () => void;
  // Whether the code was held, using it up
  take: (code: string) => boolean;
}
