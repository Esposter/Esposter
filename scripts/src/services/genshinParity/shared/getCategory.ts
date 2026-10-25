// The cause a call is counted under: a pipeline compiled, a shader module compiled, a texture or a buffer made or uploaded,
// Or, on the main thread, a node material built or a program added
export const getCategory = (name: string): string => {
  if (name === "buildNodes") return "node builds";
  if (name === "createProgram") return "programs";
  if (name.includes("Pipeline")) return "pipelines";
  if (name === "createShaderModule") return "shaders";
  if (name === "createBuffer" || name === "writeBuffer") return "buffers";
  if (name === "submit" || name === "getCurrentTexture") return "submits";
  return "textures";
};
