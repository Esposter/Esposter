import { MEDIA_ENGINE_ACCELERATION } from "#src/services/fleet/constants";
import { getOperatingSystemCapability } from "#src/services/fleet/getOperatingSystemCapability";
import { parseHardwareAccelerations } from "#src/services/fleet/parseHardwareAccelerations";
import { GAME_DIRECTORY, PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Whether FFmpeg lists the hardware acceleration the media engine decodes with. A missing FFmpeg is no engine, not an error
const checkHasMediaEngine = async (): Promise<boolean> =>
  (await getResultAsync(() => runMachineCommand("ffmpeg", ["-hide_banner", "-hwaccels"]))).match(
    (output) => parseHardwareAccelerations(output).includes(MEDIA_ENGINE_ACCELERATION),
    () => false,
  );

// The capabilities this machine holds, read off the machine: its OS, the game's install and the exports the parity tools
// Read, and a media engine. macOS always has one, and Windows has one when FFmpeg lists the Direct3D acceleration
export const readDetectedCapabilities = async (): Promise<string[]> => {
  const capabilities: string[] = [];
  const operatingSystem = getOperatingSystemCapability(process.platform);
  if (operatingSystem !== undefined) capabilities.push(operatingSystem);
  if (existsSync(join(GAME_DIRECTORY, "GenshinImpact_Data", "StreamingAssets", "AssetBundles", "blocks")))
    capabilities.push("game-install");
  if (existsSync(join(PARITY_DIRECTORY, "extracted"))) capabilities.push("game-exports");
  if (process.platform === "darwin" || (await checkHasMediaEngine())) capabilities.push("media-engine");
  return capabilities;
};
