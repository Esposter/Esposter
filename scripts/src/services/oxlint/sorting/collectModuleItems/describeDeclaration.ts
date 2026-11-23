import type { StatementDescription } from "#src/models/oxlint/sorting/StatementDescription";
import type { ESTree } from "@oxlint/plugins";

import { describeDeclared } from "#src/services/oxlint/sorting/collectModuleItems/describeDeclared";

// A declaration's description, where an unnamed class or any other statement only ends a partition
export const describeDeclaration = (
  declaration: ESTree.Node,
  isExported: boolean,
): StatementDescription | undefined => {
  switch (declaration.type) {
    case "ClassDeclaration":
      return describeDeclared("class", declaration.id?.name, declaration.declare, isExported);
    case "FunctionDeclaration":
    case "TSDeclareFunction":
      return describeDeclared("function", declaration.id?.name, declaration.declare, isExported);
    case "TSEnumDeclaration":
      return describeDeclared("enum", declaration.id.name, declaration.declare, isExported);
    case "TSInterfaceDeclaration":
      return describeDeclared("interface", declaration.id.name, declaration.declare, isExported);
    case "TSModuleDeclaration":
      return declaration.body?.type === "TSModuleBlock"
        ? { endsPartition: true, moduleBody: declaration.body.body }
        : { endsPartition: true };
    case "TSTypeAliasDeclaration":
      return describeDeclared("type", declaration.id.name, declaration.declare, isExported);
    default:
      return { endsPartition: true };
  }
};
