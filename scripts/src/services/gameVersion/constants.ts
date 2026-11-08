import type { GameVersionCommandKind } from "#src/models/gameVersion/GameVersionCommandKind";

// The kinds of command an update reruns, in the order it runs them: the extractions the fits read, the map, the fits and
// The publishes. A stamped command no kind lists is planned last, under its own heading
export const GAME_VERSION_COMMAND_KINDS: readonly GameVersionCommandKind[] = [
  {
    heading: "Extractions",
    pattern: /^(?:extract|clips|interface|shaders|inventory|playlist|avatar|scene-scripts|witness|genshin:text) /u,
  },
  { heading: "Map", pattern: /^(?:map|city-areas)$/u },
  { heading: "Fits", pattern: /^record /u },
  { heading: "Publishes", pattern: /^genshin:data /u },
];
export const UNLISTED_COMMAND_HEADING = "Commands no kind lists";
// The version a stale row names for an output whose stamp could not be read
export const NO_GAME_VERSION = "none";
