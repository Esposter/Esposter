import { MEDIA_ENGINE_ACCELERATION } from "#src/services/fleet/constants";
import { parseHardwareAccelerations } from "#src/services/fleet/parseHardwareAccelerations";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResultAsync } from "@esposter/shared";

// Whether FFmpeg lists the hardware acceleration the media engine decodes with. A missing FFmpeg is no engine, not an
// Error; any other failure of the probe is one, since reading it as no engine would drop the capability from the profile
export const checkHasMediaEngine = async (): Promise<boolean> =>
  (await getResultAsync(() => runMachineCommand("ffmpeg", ["-hide_banner", "-hwaccels"]))).match(
    (output) => parseHardwareAccelerations(output).includes(MEDIA_ENGINE_ACCELERATION),
    (error) => {
      if (!checkIsNotFound(error)) throw error;
      return false;
    },
  );
