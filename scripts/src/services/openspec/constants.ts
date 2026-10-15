export const OPENSPEC_DIRECTORY = "openspec";

// Every spec in the tree, the live ones and the delta of each open change alike; `archive/` holds shipped deltas too.
export const OPENSPEC_SPEC_PATHSPEC: `${typeof OPENSPEC_DIRECTORY}/**/spec.md` = `${OPENSPEC_DIRECTORY}/**/spec.md`;
