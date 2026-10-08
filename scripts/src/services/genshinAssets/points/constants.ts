import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// The official Teyvat Interactive Map's public API on HoYoLAB, whose main map is read in English so its labels match the
// Wiki's names. Its label tree and point list are kept as references, outside the repository like every other
export const INTERACTIVE_MAP_API_URL = "https://sg-public-api-static.hoyolab.com/common/map_user/ys_obc/v1/map";
export const INTERACTIVE_MAP_ID = 2;
export const INTERACTIVE_MAP_APP_SN = "ys_obc";
export const INTERACTIVE_MAP_LANGUAGE = "en-us";
export const INTERACTIVE_MAP_DIRECTORY: string = join(REFERENCES_DIRECTORY, "interactive-map");
export const INTERACTIVE_MAP_TREE_PATH: string = join(INTERACTIVE_MAP_DIRECTORY, "label-tree.json");
export const INTERACTIVE_MAP_POINTS_PATH: string = join(INTERACTIVE_MAP_DIRECTORY, "points.json");
export const INTERACTIVE_MAP_FIT_PATH: string = join(INTERACTIVE_MAP_DIRECTORY, "fit.json");
// The map's labels of the two kinds a fit is solved on, the Statue of The Seven and the Teleport Waypoint, which the
// Scene's transport points place as well
export const INTERACTIVE_MAP_STATUE_LABEL_ID = 2;
export const INTERACTIVE_MAP_WAYPOINT_LABEL_ID = 3;
// A fit's residual is the root-mean-square distance of its matched pairs, in game units. Over this bar the map is not
// The scene's and nothing is written: the points both place sit within about ten units of each other, so twenty is a
// Second map's distance, not a rounding one
export const INTERACTIVE_MAP_FIT_BAR = 20;
// The first pass of a match accepts a pair this far apart, and each pass after accepts the pairs within this many
// Residuals of the last fit, never closer than the bar
export const INTERACTIVE_MAP_MATCH_INITIAL_DISTANCE = 1500;
export const INTERACTIVE_MAP_MATCH_RESIDUAL_MULTIPLE = 3;
export const INTERACTIVE_MAP_MATCH_ITERATIONS = 60;
// A match starts at the map's own unit, one game unit to a coordinate: the fit solves the scale and reports how far it
// Moved from it, and the starts land in the right basin from there
export const INTERACTIVE_MAP_MATCH_START_SCALE = 1;
// The turns a match starts from, evenly spaced round the circle, each tried both as drawn and mirrored
export const INTERACTIVE_MAP_MATCH_TURNS = 16;
