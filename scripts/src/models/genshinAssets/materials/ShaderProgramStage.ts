// The stages a pass compiles a program for
export const ShaderProgramStage = {
  Domain: "Domain",
  Fragment: "Fragment",
  Geometry: "Geometry",
  Hull: "Hull",
  Vertex: "Vertex",
} as const;
export type ShaderProgramStage = (typeof ShaderProgramStage)[keyof typeof ShaderProgramStage];
