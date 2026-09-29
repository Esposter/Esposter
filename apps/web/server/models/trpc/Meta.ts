// What a procedure declares about itself beyond its input and output
export interface Meta {
  // Opts the procedure into the MCP endpoint as a tool. The description is what an agent chooses the tool by, and the
  // One thing a procedure has no other place for
  mcp?: { description: string };
}
