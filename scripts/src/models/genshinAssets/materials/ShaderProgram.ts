// A compiled program of a shader, named by the pass and stage it is compiled for and the keyword set selecting it. A
// Program carved from a shader whose serialized form is not read has no pass, stage or keywords
export interface ShaderProgram {
  code: Buffer;
  keywords: string[];
  pass: string;
  stage: string;
}
