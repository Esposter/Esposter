import { downloadClip } from "#src/services/recreation/video/downloadClip";
import { getClipName } from "#src/services/recreation/video/getClipName";

// A section of a public video downloaded into the directory under the clip name its arguments give, its path returned
export const downloadClipSection = (
  { from, name, to, url }: { from: string; name: string; to: string; url: string },
  directory: string,
): Promise<string> => downloadClip(url, Number(from), Number(to), getClipName(name, from, to), directory);
