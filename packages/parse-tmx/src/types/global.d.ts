declare global {
  interface Uint8ArrayConstructor {
    // @TODO: Remove this when TypeScript's bundled lib declares Uint8Array.fromBase64.
    fromBase64(source: string): Uint8Array;
  }
}

export {};
