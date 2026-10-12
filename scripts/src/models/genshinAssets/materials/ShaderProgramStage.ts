// The stages a pass compiles a program for, in the order its serialized form lists them
export enum ShaderProgramStage {
  Domain = "Domain",
  Fragment = "Fragment",
  Geometry = "Geometry",
  Hull = "Hull",
  Vertex = "Vertex",
}
