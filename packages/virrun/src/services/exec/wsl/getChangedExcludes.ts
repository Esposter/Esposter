// Every exclude the two sets disagree on — the symmetric difference of a mirror's published exclude set and the one in
// Force now. Membership only, never order: resolveMirrorExcludes builds its set by appending discovered entries
// (linked worktrees, prepare outputs) to the base patterns, so a reordering must not read as a change.
//
// The two consumers split this result on pattern shape and must split the SAME result, which is why the difference is
// Derived once here: createWslSourceMirrorSync asks whether any changed exclude is a bare name (the one shape a delete
// List cannot target, so it forces the clearing full materialize), and diffSourceMirrorManifests turns every changed
// Path pattern into an `rm -rf`. A path on either side of the change appears in neither manifest, so nothing but this
// Comparison can see it at all.
export const getChangedExcludes = (previous: readonly string[], current: readonly string[]): string[] => {
  const previousExcludes = new Set(previous);
  const currentExcludes = new Set(current);
  return [...new Set([...previous, ...current])].filter(
    (exclude) => previousExcludes.has(exclude) !== currentExcludes.has(exclude),
  );
};
