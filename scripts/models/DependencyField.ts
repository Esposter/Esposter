// The manifest fields a dependency specifier can appear under. `engines` is not one of them: it pins a runtime
// Rather than a package, and it is checked against the registry rather than against the catalog.
export enum DependencyField {
  Dependencies = "dependencies",
  DevDependencies = "devDependencies",
  OptionalDependencies = "optionalDependencies",
  PeerDependencies = "peerDependencies",
}

export const DependencyFields: DependencyField[] = Object.values(DependencyField);
