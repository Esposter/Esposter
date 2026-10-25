// The window fields the page keeps for the run: the frames it drew, the renderer it hands over and the pointer lock the orbit fakes
// The renderer as the run reads it: its program count is what grows as a pipeline first draws
export interface StallRenderer {
  info: { memory: { programs: number } };
}
