// The manifest fields a dependency specifier can appear under. `engines` is not one of them: it pins a runtime
// Rather than a package, and it is checked against the registry rather than against the catalog.
export const DependencyField = {
  Dependencies: "dependencies",
  DevDependencies: "devDependencies",
  OptionalDependencies: "optionalDependencies",
  PeerDependencies: "peerDependencies",
} as const;
export type DependencyField = (typeof DependencyField)[keyof typeof DependencyField];

export const DEPENDENCY_FIELDS: DependencyField[] = Object.values(DependencyField);
