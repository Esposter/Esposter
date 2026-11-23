import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";

export interface SortingNode extends SortingItem {
  // The names this node's value reads, each one a node that must sort ahead of this one
  dependencies: string[];
  // The names this node binds, so a node reading one of them sorts after this node
  dependencyNames: string[];
  // Set when a disable directive for the rule covers the node's first line, so the node keeps its place
  isOxlintDisabled: boolean;
  // The text a value sort compares, empty for a rule that sorts by name alone
  value: string;
}
