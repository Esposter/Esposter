export interface PairingCodes {
  add: (code: string, duration: number) => void;
  clear: () => void;
  // Whether the code was held, using it up
  take: (code: string) => boolean;
}
