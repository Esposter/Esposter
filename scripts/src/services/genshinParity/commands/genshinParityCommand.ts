import type { CommandDef } from "citty";

import { bandsCommand } from "#src/services/genshinParity/commands/bandsCommand";
import { attacksCommand } from "#src/services/genshinParity/commands/attacksCommand";
import { benchCommand } from "#src/services/genshinParity/commands/benchCommand";
import { calibrateCommand } from "#src/services/genshinParity/commands/calibrateCommand";
import { cloudsCommand } from "#src/services/genshinParity/commands/cloudsCommand";
import { compareCommand } from "#src/services/genshinParity/commands/compareCommand";
import { coverCommand } from "#src/services/genshinParity/commands/coverCommand";
import { decayCommand } from "#src/services/genshinParity/commands/decayCommand";
import { expressionCommand } from "#src/services/genshinParity/commands/expressionCommand";
import { fetchCommand } from "#src/services/genshinParity/commands/fetchCommand";
import { filmCommand } from "#src/services/genshinParity/commands/filmCommand";
import { fogCommand } from "#src/services/genshinParity/commands/fogCommand";
import { framesCommand } from "#src/services/genshinParity/commands/framesCommand";
import { gbufferCommand } from "#src/services/genshinParity/commands/gbufferCommand";
import { glideCommand } from "#src/services/genshinParity/commands/glideCommand";
import { instrumentsCommand } from "#src/services/genshinParity/commands/instrumentsCommand";
import { launchCommand } from "#src/services/genshinParity/commands/launchCommand";
import { listenCommand } from "#src/services/genshinParity/commands/listenCommand";
import { lumaCommand } from "#src/services/genshinParity/commands/lumaCommand";
import { measureCommand } from "#src/services/genshinParity/commands/measureCommand";
import { noiseCommand } from "#src/services/genshinParity/commands/noiseCommand";
import { overlayCommand } from "#src/services/genshinParity/commands/overlayCommand";
import { partsCommand } from "#src/services/genshinParity/commands/partsCommand";
import { placeCommand } from "#src/services/genshinParity/commands/placeCommand";
import { planCommand } from "#src/services/genshinParity/commands/planCommand";
import { polarCommand } from "#src/services/genshinParity/commands/polarCommand";
import { poseCommand } from "#src/services/genshinParity/commands/poseCommand";
import { rankCommand } from "#src/services/genshinParity/commands/rankCommand";
import { recordCommand } from "#src/services/genshinParity/commands/recordCommand";
import { shootCommand } from "#src/services/genshinParity/commands/shootCommand";
import { skyCommand } from "#src/services/genshinParity/commands/skyCommand";
import { solosCommand } from "#src/services/genshinParity/commands/solosCommand";
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
    clouds: cloudsCommand,
    cover: coverCommand,
    compare: compareCommand,
    gbuffer: gbufferCommand,
    calibrate: calibrateCommand,
    sky: skyCommand,
    fog: fogCommand,
    overlay: overlayCommand,
    pose: poseCommand,
    place: placeCommand,
    plan: planCommand,
    parts: partsCommand,
    track: trackCommand,
    glide: glideCommand,
    shoot: shootCommand,
    bands: bandsCommand,
    attacks: attacksCommand,
    decay: decayCommand,
    instruments: instrumentsCommand,
    solos: solosCommand,
    bench: benchCommand,
    expression: expressionCommand,
    listen: listenCommand,
    noise: noiseCommand,
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
    rank: rankCommand,
    record: recordCommand,
  },
});
