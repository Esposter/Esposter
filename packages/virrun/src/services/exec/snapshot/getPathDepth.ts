// A relative path's depth is its "/" count; buildFlushPlan decorates each copy with it once so the parent-first sort
// Never recounts (a build's upper can hold thousands).
export const getPathDepth = (relativePath: string): number => {
  let depth = 0;
  for (const character of relativePath) if (character === "/") depth++;
  return depth;
};
