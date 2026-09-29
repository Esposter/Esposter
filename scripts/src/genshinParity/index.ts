import { ParityMotion } from "#src/models/genshinParity/ParityMotion";
import { captureGame } from "#src/services/genshinParity/captureGame";
import { compareScreen } from "#src/services/genshinParity/compareScreen";
import { RECORD_DEFAULT_SECONDS } from "#src/services/genshinParity/constants";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { launchGame } from "#src/services/genshinParity/launchGame";
import { measureImage } from "#src/services/genshinParity/measureImage";
import { measureLuma } from "#src/services/genshinParity/measureLuma";
import { sampleFrames } from "#src/services/genshinParity/sampleFrames";
import { shootScreen } from "#src/services/genshinParity/shootScreen";
import { traceImage } from "#src/services/genshinParity/traceImage";
import { zoomImage } from "#src/services/genshinParity/zoomImage";

const USAGE = `genshin:parity <command>
  fetch                                  every reference not yet held
  compare <reference>                    shoot its screen, then reference | ours | difference and the scores
  shoot <screen> <width> <height> [entry|props] [ms…]
                                         the parity page's screen, its entry or its fixture's motion (the
                                         default) held at each time when given
  frames <file | File:title> [fps] [start] [seconds]
                                         a GIF or video as frames and a contact sheet, a video over a window
  measure <image> <x,y>…                 the colour under each point
  luma <x> <y> <w> <h> <image>…          a region's darkness across images, as a curve
  zoom <image> <x> <y> <w> <h> [scale]   a region enlarged with hard edges
  trace <image | File:title> <x> <y> <w> <h> [scale]
                                         a glyph in a region as an SVG path at full resolution (scale 1), and
                                         region | trace to check; enlarge a small mark with a scale above 1
  launch                                 start the game (it asks for elevation)
  still <name>                           the game's window, once
  record <name> [seconds]                the game's window once it opens, two minutes unless told`;
const [command, ...parameters] = process.argv.slice(2);
const [first = "", second = "", third = "", fourth = "", fifth = "", sixth = ""] = parameters;

if (command === "fetch") await fetchReferences();
else if (command === "compare") await compareScreen(first);
else if (command === "shoot") {
  const [motionOrTime = "", ...times] = parameters.slice(3);
  const motion = Object.values(ParityMotion).find((value) => value === motionOrTime);
  const timesMs = (motion ? times : [motionOrTime, ...times]).filter(Boolean).map(Number);
  await shootScreen(first, Number(second), Number(third), timesMs, motion);
} else if (command === "frames")
  await sampleFrames(first, Number(second || 10), Number(third || 0), fourth ? Number(fourth) : undefined);
else if (command === "measure") await measureImage(first, parameters.slice(1));
else if (command === "luma")
  await measureLuma(Number(first), Number(second), Number(third), Number(fourth), parameters.slice(4));
else if (command === "zoom")
  await zoomImage(first, Number(second), Number(third), Number(fourth), Number(fifth), Number(sixth || 8));
else if (command === "trace")
  await traceImage(first, Number(second), Number(third), Number(fourth), Number(fifth), Number(sixth || 1));
else if (command === "launch") launchGame();
else if (command === "still") await captureGame(first);
else if (command === "record") await captureGame(first, Number(second || RECORD_DEFAULT_SECONDS));
else console.log(USAGE);
