export const OPENSPEC_DIRECTORY = "openspec";
export const OPENSPEC_SPEC_FILE = "/spec.md";

// Every spec in the tree, the live ones and the delta of each open change alike; `archive/` holds shipped deltas too.
export const OPENSPEC_SPEC_PATHSPEC: `${typeof OPENSPEC_DIRECTORY}/**${typeof OPENSPEC_SPEC_FILE}` = `${OPENSPEC_DIRECTORY}/**${OPENSPEC_SPEC_FILE}`;
