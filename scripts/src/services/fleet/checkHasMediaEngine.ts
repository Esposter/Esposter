import { MEDIA_ENGINE_ACCELERATION } from "#src/services/fleet/constants";
import { parseHardwareAccelerations } from "#src/services/fleet/parseHardwareAccelerations";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";

// Whether FFmpeg lists the hardware acceleration the media engine decodes with. A missing FFmpeg is no engine, not an error
export const checkHasMediaEngine = async (): Promise<boolean> =>
  (await getResultAsync(() => runMachineCommand("ffmpeg", ["-hide_banner", "-hwaccels"]))).match(
    (output) => parseHardwareAccelerations(output).includes(MEDIA_ENGINE_ACCELERATION),
    () => false,
  );
