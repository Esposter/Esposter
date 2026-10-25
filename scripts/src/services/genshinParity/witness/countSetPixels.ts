export const countSetPixels = (mask: Uint8Array): number => mask.reduce((count, isSet) => count + isSet, 0);
