import type { StatementDescription } from "#src/models/oxlint/sorting/StatementDescription";
import type { ESTree } from "@oxlint/plugins";

import { describeDeclaration } from "#src/services/oxlint/sorting/collectModuleItems/describeDeclaration";

// The statements that end a partition without declaring anything sortable
const PARTITION_STATEMENT_TYPES = new Set([
  "BlockStatement",
  "DoWhileStatement",
  "ExpressionStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "IfStatement",
  "LabeledStatement",
  "ReturnStatement",
  "SwitchStatement",
  "ThrowStatement",
  "TryStatement",
  "TSExportAssignment",
  "TSImportEqualsDeclaration",
  "WhileStatement",
  "WithStatement",
]);

// A statement's description: its declaration, the statements it holds, and whether it ends a partition.
// A statement sort-modules does not read describes as undefined, and leaves the partition as it is.
export const describeStatement = (statement: ESTree.Program["body"][number]): StatementDescription | undefined => {
  switch (statement.type) {
    case "ClassDeclaration":
    case "FunctionDeclaration":
    case "TSDeclareFunction":
    case "TSEnumDeclaration":
    case "TSInterfaceDeclaration":
    case "TSModuleDeclaration":
    case "TSTypeAliasDeclaration":
    case "VariableDeclaration":
      return describeDeclaration(statement, false);
    case "ExportDefaultDeclaration":
      return describeDeclaration(statement.declaration, true);
    case "ExportNamedDeclaration":
      return statement.declaration ? describeDeclaration(statement.declaration, true) : undefined;
    default:
      return PARTITION_STATEMENT_TYPES.has(statement.type) ? { endsPartition: true } : undefined;
  }
};
