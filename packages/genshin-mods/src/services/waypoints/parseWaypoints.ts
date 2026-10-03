import { MAX_WAYPOINTS, NO_WAYPOINTS_ANSWER } from "../constants";

const LIST_MARKER_REGEX = /^(?:[-*•]|\d+[.)])\s+/u;

// The fork answers in prose it was asked to keep to lines, so a list marker it added anyway is dropped rather than
// Sent back as part of the prompt, and an answer of none, or nothing, leaves no step
export const parseWaypoints = (answer: string): string[] =>
  answer
    .split("\n")
    .map((line) => line.trim().replace(LIST_MARKER_REGEX, "").trim())
    .filter((line) => line && line !== NO_WAYPOINTS_ANSWER)
    .slice(0, MAX_WAYPOINTS);
