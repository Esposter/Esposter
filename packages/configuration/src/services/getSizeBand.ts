import { KIBIBYTE, SIZE_BAND_HEADROOM } from "#src/services/constants";

// The kibibyte band a bundle of this many bytes is held to: the smallest power of two that leaves a tenth of its size
// to spare. A doubling always moves a bundle to a larger band, while growth of a few percent usually stays in the band
// it already sits in, so a size snapshot fails on a change large enough to matter and on nothing smaller
export const getSizeBand = (bytes: number): number =>
  2 ** Math.ceil(Math.log2((bytes * SIZE_BAND_HEADROOM) / KIBIBYTE));
