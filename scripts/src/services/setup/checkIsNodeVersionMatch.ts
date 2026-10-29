// node reports its version with a leading `v`, and `.node-version` pins it without one
export const checkIsNodeVersionMatch = (running: string, pinned: string): boolean =>
  running.replace(/^v/u, "") === pinned.trim();
