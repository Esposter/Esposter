import type { ESTree } from "@oxlint/plugins";

export type ClassElement = ESTree.AccessorProperty | ESTree.MethodDefinition | ESTree.PropertyDefinition;
