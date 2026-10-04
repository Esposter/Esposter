// The property names a shader's raw export declares, in the order it declares them: they lead the export as plain
// Unity strings, ahead of the first compiled program, and are what tells a nameless shader apart (the sky's
// `_SkyGradientTex`, the stone's `_RGColor`) and names the values its programs read
const PROPERTY_NAME_REGEX = /_[A-Za-z][A-Za-z0-9_]{2,}/gu;
const PROGRAM_MAGIC = "DXBC";

export const parseShaderPropertyNames = (data: Buffer): string[] => {
  const programOffset = data.indexOf(PROGRAM_MAGIC);
  const header = data.toString("latin1", 0, programOffset === -1 ? data.length : programOffset);
  return [...new Set(header.match(PROPERTY_NAME_REGEX))];
};
