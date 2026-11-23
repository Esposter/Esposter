import type { ESTree } from "@oxlint/plugins";

// Whether a class's definition runs no code: its heritage clause and the computed key of each member run when the class
// Is defined, a static block does, and a static field or accessor does through its initialiser. The expression check is
// passed in, since importing it here would make the two modules import each other
export const checkHasPureMembers = (node: ESTree.Class, checkIsPure: (expression: ESTree.Node) => boolean): boolean =>
  (!node.superClass || checkIsPure(node.superClass)) &&
  node.body.body.every((element) => {
    if (element.type === "StaticBlock") return false;
    if ("computed" in element && element.computed && !checkIsPure(element.key)) return false;
    if (
      (element.type !== "PropertyDefinition" && element.type !== "AccessorProperty") ||
      !element.static ||
      !element.value
    )
      return true;
    return checkIsPure(element.value);
  });
