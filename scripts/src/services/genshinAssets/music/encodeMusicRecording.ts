import { MUSIC_RECORDING_BITRATE } from "#src/services/genshinAssets/shared/constants";
import { resolveFfmpeg } from "#src/services/genshinParity/shared/resolveFfmpeg";
import { execFileSync } from "node:child_process";

// One recording as a piece ships it: from `startFrame`, counted at the recording's own rate, where its mapping says its
// Sound starts, for `seconds`, its channels averaged into one as the solve read it, as Opus in Ogg at
// `MUSIC_RECORDING_BITRATE`
export const encodeMusicRecording = async (
  sourcePath: string,
  startFrame: number,
  seconds: number,
  outputPath: string,
): Promise<void> => {
  const ffmpegPath = await resolveFfmpeg();
  execFileSync(ffmpegPath, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    sourcePath,
    "-af",
    `atrim=start_sample=${startFrame},asetpts=PTS-STARTPTS,atrim=duration=${seconds}`,
    "-ac",
    "1",
    "-c:a",
    "libopus",
    "-b:a",
    MUSIC_RECORDING_BITRATE,
    outputPath,
  ]);
};
