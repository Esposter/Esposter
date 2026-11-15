// A recreation pass, one kind of unknown each, run in `PARITY_PASS_ORDER`
// (openspec/changes/genshin-recreation-passes/design.md)
export const ParityPass = {
  Atmosphere: "Atmosphere",
  Audio: "Audio",
  Camera: "Camera",
  Display: "Display",
  Inventory: "Inventory",
  Layout: "Layout",
  Light: "Light",
  Motion: "Motion",
  Shape: "Shape",
  Surface: "Surface",
} as const;
export type ParityPass = (typeof ParityPass)[keyof typeof ParityPass];
