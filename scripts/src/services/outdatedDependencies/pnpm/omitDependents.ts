import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";

// A manifest npm installs is also a workspace member, so `pnpm outdated` lists its packages under its name from
// The workspace lockfile — while the registry lists the same packages under the same name from the npm lockfile,
// Which is the one its install resolves. The pnpm row keeps its other dependents and goes when none are left.
export const omitDependents = (dependencies: OutdatedDependency[], omitted: Set<string>): OutdatedDependency[] =>
  dependencies.flatMap((dependency) => {
    const dependents = dependency.dependents.filter((dependent) => !omitted.has(dependent));
    return dependents.length === 0 && dependency.dependents.length > 0 ? [] : [{ ...dependency, dependents }];
  });
