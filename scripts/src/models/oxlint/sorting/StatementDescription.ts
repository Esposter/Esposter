import type { StatementDeclaration } from "#src/models/oxlint/sorting/StatementDeclaration";
import type { ESTree } from "@oxlint/plugins";

export interface StatementDescription {
  declaration?: StatementDeclaration;
  // Whether the statement ends its partition, so the statements after it sort apart from the ones before
  endsPartition: boolean;
  // The statements of a namespace or an ambient module, which sort as a module of their own
  moduleBody?: ESTree.Program["body"];
}
