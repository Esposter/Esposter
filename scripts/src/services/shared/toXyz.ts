import type { Vector } from "#src/models/shared/Vector";

// A linear sRGB colour in CIE XYZ under D65, by the matrix the standard's primaries and white give
export const toXyz = ([r, g, b]: Vector): Vector => [
  (10_135_552 / 24_577_794) * r + (8_788_810 / 24_577_794) * g + (4_435_075 / 24_577_794) * b,
  (2_613_072 / 12_288_897) * r + (8_788_810 / 12_288_897) * g + (887_015 / 12_288_897) * b,
  (1_425_312 / 73_733_382) * r + (8_788_810 / 73_733_382) * g + (70_074_185 / 73_733_382) * b,
];
