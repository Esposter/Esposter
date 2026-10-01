import type { CommandDef } from "citty";

import { attributeCommand } from "#src/services/genshinParity/commands/attributeCommand";
import { benchCommand } from "#src/services/genshinParity/commands/benchCommand";
import { calibrateCommand } from "#src/services/genshinParity/commands/calibrateCommand";
import { compareCommand } from "#src/services/genshinParity/commands/compareCommand";
import { exposureCommand } from "#src/services/genshinParity/commands/exposureCommand";
import { fetchCommand } from "#src/services/genshinParity/commands/fetchCommand";
import { filmCommand } from "#src/services/genshinParity/commands/filmCommand";
import { framesCommand } from "#src/services/genshinParity/commands/framesCommand";
import { gbufferCommand } from "#src/services/genshinParity/commands/gbufferCommand";
import { glideCommand } from "#src/services/genshinParity/commands/glideCommand";
import { hazeCommand } from "#src/services/genshinParity/commands/hazeCommand";
import { launchCommand } from "#src/services/genshinParity/commands/launchCommand";
import { lightCommand } from "#src/services/genshinParity/commands/lightCommand";
import { lumaCommand } from "#src/services/genshinParity/commands/lumaCommand";
import { measureCommand } from "#src/services/genshinParity/commands/measureCommand";
import { overlayCommand } from "#src/services/genshinParity/commands/overlayCommand";
import { partsCommand } from "#src/services/genshinParity/commands/partsCommand";
import { placeCommand } from "#src/services/genshinParity/commands/placeCommand";
import { polarCommand } from "#src/services/genshinParity/commands/polarCommand";
import { poseCommand } from "#src/services/genshinParity/commands/poseCommand";
import { recordCommand } from "#src/services/genshinParity/commands/recordCommand";
import { shootCommand } from "#src/services/genshinParity/commands/shootCommand";
import { skyCommand } from "#src/services/genshinParity/commands/skyCommand";
import { stillCommand } from "#src/services/genshinParity/commands/stillCommand";
import { traceCommand } from "#src/services/genshinParity/commands/traceCommand";
import { trackCommand } from "#src/services/genshinParity/commands/trackCommand";
import { viewCommand } from "#src/services/genshinParity/commands/viewCommand";
import { zoomCommand } from "#src/services/genshinParity/commands/zoomCommand";
import { defineCommand } from "citty";

// The parity loop's tool, one subcommand a step (apps/web/content/docs/genshin/parity.md)
export const genshinParityCommand: CommandDef = defineCommand({
  meta: { description: "Shoot, score, trace and record the game's screens against ours", name: "genshin:parity" },
  subCommands: {
    fetch: fetchCommand,
    compare: compareCommand,
    attribute: attributeCommand,
    gbuffer: gbufferCommand,
    calibrate: calibrateCommand,
    sky: skyCommand,
    exposure: exposureCommand,
    haze: hazeCommand,
    light: lightCommand,
    overlay: overlayCommand,
    pose: poseCommand,
    place: placeCommand,
    parts: partsCommand,
    track: trackCommand,
    glide: glideCommand,
    shoot: shootCommand,
    bench: benchCommand,
    film: filmCommand,
    view: viewCommand,
    frames: framesCommand,
    measure: measureCommand,
    luma: lumaCommand,
    zoom: zoomCommand,
    polar: polarCommand,
    trace: traceCommand,
    launch: launchCommand,
    still: stillCommand,
    record: recordCommand,
  },
});
