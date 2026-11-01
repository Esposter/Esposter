export interface PairingCodes {
  add: (code: string, durationMs: number) => void;
  clear: () => void;
  // The MAC of the text under each code now held, which tells a page holding one of them that the host knows it
  prove: (text: string) => string[];
  // Whether the code was held, using it up
  take: (code: string) => boolean;
}
