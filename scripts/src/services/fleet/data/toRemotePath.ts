// A path on the peer, quoted for its POSIX shell: a leading ~/ becomes the peer's $HOME, and the rest is single-quoted so
// No space or $ in it splits the argument
export const toRemotePath = (path: string): string => {
  const quoted = `'${path.replace(/^~\//, "").replaceAll("'", "'\\''")}'`;
  return path.startsWith("~/") ? `"$HOME"/${quoted}` : quoted;
};
