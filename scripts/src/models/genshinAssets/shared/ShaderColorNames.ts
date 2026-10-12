// The names a material's shader declares as colours, which Unity decodes from sRGB to linear light before a program reads
// Them, and as vectors, which it never decodes, a colour the shader marks gamma among them. Unity saves both in a
// Material's one table of colours, so only the shader tells a vector from a colour, and a name in both is declared each
// Way by two copies of the shader
export interface ShaderColorNames {
  colorNames: ReadonlySet<string>;
  vectorNames: ReadonlySet<string>;
}
