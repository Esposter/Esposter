import type { LockTreeNode } from "#src/models/outdatedDependencies/shared/LockTreeNode";

// A key, quoted or not, then its colon and any text after it. The key ends at the first colon that is followed by a
// Space or the line's end, so a value such as `link:../x` keeps its own colon
const LINE_REGEX = /^(?<indentation> *)(?<quote>'?)(?<key>.+?)\k<quote>:(?: (?<value>.+))?$/u;

// The keys of a YAML document nested by their indentation, in the shape pnpm writes its lockfile. A line that is not a
// Key, such as a list item, is no node and is skipped
export const parseLockTree = (lockYaml: string): LockTreeNode => {
  const root: LockTreeNode = { children: new Map() };
  const stack: { indent: number; node: LockTreeNode }[] = [{ indent: -1, node: root }];
  for (const line of lockYaml.split("\n")) {
    const groups = LINE_REGEX.exec(line)?.groups;
    if (!groups?.key) continue;

    const indent = (groups.indentation ?? "").length;
    while ((stack.at(-1)?.indent ?? -1) >= indent) stack.pop();
    const node: LockTreeNode = { children: new Map(), value: groups.value };
    (stack.at(-1)?.node ?? root).children.set(groups.key, node);
    stack.push({ indent, node });
  }
  return root;
};
