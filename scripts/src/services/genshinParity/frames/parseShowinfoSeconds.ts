// The second each frame is shown at, read from the lines FFmpeg's showinfo filter prints for every frame it passes, in the
// Order they come, so the list's index is the frame's index
export const parseShowinfoSeconds = (log: string): number[] =>
  Array.from(log.matchAll(/pts_time:(?<seconds>\S+)/gu), ({ groups }) => Number(groups?.seconds));
