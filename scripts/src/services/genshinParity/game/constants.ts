import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

export const CAPTURES_DIRECTORY: string = join(PARITY_DIRECTORY, "captures");
export const RECORD_FRAME_RATE = 60;

// Encoded on the GPU (this machine's AMD card, through AMF) so the game keeps the CPU and its timing, at a constant
// Quantiser low enough that edges and colours measure as the game drew them. The frames are converted to BT.709
// Limited-range YUV and labelled so first: handed the window's BGRA, AMF converts to limited range itself but labels
// The stream full range, and every value then reads squeezed, white as 234
export const RECORD_ENCODING: string[] = [
  "-vf",
  "scale=out_range=tv:out_color_matrix=bt709,format=yuv420p",
  "-color_range",
  "tv",
  "-colorspace",
  "bt709",
  "-c:v",
  "h264_amf",
  "-rc",
  "cqp",
  "-qp_i",
  "12",
  "-qp_p",
  "12",
];
