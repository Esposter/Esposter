// A counter taken as a call's id orders that call's reads by hand: the newest id is the one that lands, which is a run
// Scope's job. `useRunScope`, and `executeQuery`'s `runScope`, key each run, abort the one before it and commit only the
// Newest, so a counter is never how overlapping async work is ordered. The run scope is an app primitive, so the list is
// Spread into the app's own overrides, and a package with no run scope to name keeps its counters.
export default [
  {
    message:
      "Don't take a counter's value as a call's id to order overlapping reads — a run scope (`useRunScope`, or `executeQuery`'s `runScope`) keys each read and commits only the newest. See the vue-composable-patterns skill.",
    selector: "VariableDeclarator[init.type='UpdateExpression']",
  },
];
