import type { ModuleItems } from "#src/models/oxlint/sorting/ModuleItems";
import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";
import type { ESTree } from "@oxlint/plugins";

// The groups a module's declarations sort into, in perfectionist's default order.
// A declaration sits in its kind's `declare-` group when ambient, and in its `export-` group when exported.
// Otherwise it sits in the bare kind's group.
const GROUP_NAMES: (string | string[])[] = [
  "declare-enum",
  "export-enum",
  "enum",
  ["declare-interface", "declare-type"],
  ["export-interface", "export-type"],
  ["interface", "type"],
  "declare-class",
  "class",
  "export-class",
  "declare-function",
  "export-function",
  "function",
];

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

interface StatementDeclaration {
  // The group name the declaration sorts under, such as `export-class`
  group: string;
  name: string;
}

interface StatementDescription {
  declaration?: StatementDeclaration;
  // Whether the statement ends its partition, so the statements after it sort apart from the ones before
  endsPartition: boolean;
  // The statements of a namespace or an ambient module, which sort as a module of their own
  moduleBody?: ESTree.Program["body"];
}

const getGroupIndex = (group: string): number =>
  GROUP_NAMES.findIndex((groupNames) =>
    typeof groupNames === "string" ? groupNames === group : groupNames.includes(group),
  );

// The group a declaration sorts under: ambient declarations first, then exported ones, then the bare kind
const describeDeclared = (
  kind: string,
  name: string | undefined,
  isDeclare: boolean | undefined,
  isExported: boolean,
): StatementDescription | undefined => {
  if (name === undefined) return undefined;
  const group = isDeclare ? `declare-${kind}` : isExported ? `export-${kind}` : kind;
  return { declaration: { group, name }, endsPartition: false };
};

// A declaration's description, where an unnamed class or any other statement only ends a partition
const describeDeclaration = (declaration: ESTree.Node, isExported: boolean): StatementDescription | undefined => {
  switch (declaration.type) {
    case "ClassDeclaration":
      return declaration.id
        ? describeDeclared("class", declaration.id.name, declaration.declare, isExported)
        : { endsPartition: true };
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

// A statement's description: its declaration, the statements it holds, and whether it ends a partition.
// A statement sort-modules does not read describes as undefined, and leaves the partition as it is.
const describeStatement = (statement: ESTree.Program["body"][number]): StatementDescription | undefined => {
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

// The module's declarations in partitions, and the statement lists of the namespaces and ambient modules inside it.
// A partition is never sorted across an unsortable statement, so each one is sorted apart from the others
export const collectModuleItems = (statements: ESTree.Program["body"]): ModuleItems => {
  const moduleBodies: ESTree.Program["body"][] = [];
  const partitions: SortingGroupItem[][] = [];
  let partition: SortingGroupItem[] = [];
  for (const statement of statements) {
    const description = describeStatement(statement);
    if (description === undefined) continue;
    if (description.declaration) {
      const { group, name } = description.declaration;
      partition.push({
        dependencies: [],
        dependencyNames: [name],
        // A declaration is never pinned in place: it sorts by its name within its group.
        group,
        groupIndex: getGroupIndex(group),
        isOxlintDisabled: false,
        name,
        node: statement,
        value: "",
      });
    }
    if (description.moduleBody) moduleBodies.push(description.moduleBody);
    if (description.endsPartition) {
      partitions.push(partition);
      partition = [];
    }
  }
  partitions.push(partition);
  return { moduleBodies, partitions };
};
