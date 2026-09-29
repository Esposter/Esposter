import { captureGame } from "#src/services/genshinParity/captureGame";
import { compareScreen } from "#src/services/genshinParity/compareScreen";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { launchGame } from "#src/services/genshinParity/launchGame";
import { measureImage } from "#src/services/genshinParity/measureImage";
import { sampleFrames } from "#src/services/genshinParity/sampleFrames";
import { shootScreen } from "#src/services/genshinParity/shootScreen";
import { traceImage } from "#src/services/genshinParity/traceImage";
import { zoomImage } from "#src/services/genshinParity/zoomImage";

const USAGE = `genshin:parity <command>
  fetch                                  every reference not yet held
  compare <reference>                    shoot its screen, then reference | ours | difference and the scores
  shoot <screen> <width> <height> [ms…]  the parity page's screen, paused at each time when given
  frames <file | File:title> [fps]       a GIF or video as frames and a contact sheet
  measure <image> <x,y>…                 the colour under each point
  zoom <image> <x> <y> <w> <h> [scale]   a region enlarged with hard edges
  trace <image | File:title> <x> <y> <w> <h> [scale]
                                         a glyph in a region as an SVG path at full resolution (scale 1), and
                                         region | trace to check; enlarge a small mark with a scale above 1
  launch                                 start the game (it asks for elevation)
  still <name>                           the game's window, once
  record <name> <seconds>                the game's window, recorded`;
const [command, ...parameters] = process.argv.slice(2);
const [first = "", second = "", third = "", fourth = "", fifth = "", sixth = ""] = parameters;

if (command === "fetch") await fetchReferences();
else if (command === "compare") await compareScreen(first);
else if (command === "shoot") await shootScreen(first, Number(second), Number(third), parameters.slice(3).map(Number));
else if (command === "frames") await sampleFrames(first, Number(second || 10));
else if (command === "measure") await measureImage(first, parameters.slice(1));
else if (command === "zoom")
  await zoomImage(first, Number(second), Number(third), Number(fourth), Number(fifth), Number(sixth || 8));
else if (command === "trace")
  await traceImage(first, Number(second), Number(third), Number(fourth), Number(fifth), Number(sixth || 1));
else if (command === "launch") launchGame();
else if (command === "still") await captureGame(first);
else if (command === "record") await captureGame(first, Number(second));
else console.log(USAGE);
