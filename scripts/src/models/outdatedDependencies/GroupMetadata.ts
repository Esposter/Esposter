// How a registry-checked entry is labelled in the report: the type shown beside the package, and the one
// Dependent it is attributed to, since a workspace section rather than a manifest declares it.
export interface GroupMetadata {
  dependencyType: string;
  dependent: string;
}
