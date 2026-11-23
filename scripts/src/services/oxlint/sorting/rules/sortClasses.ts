import type { SortingClassMember } from "#src/models/oxlint/sorting/SortingClassMember";
import type { ESTree, Rule, SourceCode } from "@oxlint/plugins";

import { CLASS_MEMBER_GROUPS } from "#src/services/oxlint/sorting/classMemberGroups";
import { computeClassMemberGroup } from "#src/services/oxlint/sorting/computeClassMemberGroup";
import { populateClassMemberDependencies } from "#src/services/oxlint/sorting/populateClassMemberDependencies";
import { reportUnsortedByGroup } from "#src/services/oxlint/sorting/reportUnsortedByGroup";
import { withEvaluated } from "#src/services/oxlint/sorting/withEvaluated";
import { defineRule } from "@oxlint/plugins";

// The members perfectionist's sort-classes reads. A class with fewer than two of them has nothing to sort
const KNOWN_ELEMENT_TYPES = new Set([
  "AccessorProperty",
  "MethodDefinition",
  "PropertyDefinition",
  "StaticBlock",
  "TSAbstractAccessorProperty",
  "TSAbstractMethodDefinition",
  "TSAbstractPropertyDefinition",
  "TSIndexSignature",
]);

// A member's name as it sorts and is depended on: a private member keeps its hash, and a computed key is its source
const computeKeyName = (
  sourceCode: SourceCode,
  key: ESTree.PropertyDefinition["key"],
): { bareName: string; hasPrivateHash: boolean; name: string } => {
  if (key.type === "PrivateIdentifier") return { bareName: key.name, hasPrivateHash: true, name: `#${key.name}` };
  if (key.type === "Identifier") return { bareName: key.name, hasPrivateHash: false, name: key.name };
  if (key.type === "Literal") {
    const name = String(key.value);
    return { bareName: name, hasPrivateHash: false, name };
  }
  const name = sourceCode.getText(key);
  return { bareName: name, hasPrivateHash: false, name };
};

const computeMethodSelectors = (kind: ESTree.MethodDefinition["kind"]): string[] => {
  switch (kind) {
    case "constructor":
      return ["constructor", "method"];
    case "get":
      return ["get-method", "method"];
    case "set":
      return ["set-method", "method"];
    default:
      return ["method"];
  }
};

const computeKeyedSelectors = (
  element: ESTree.AccessorProperty | ESTree.MethodDefinition | ESTree.PropertyDefinition,
): string[] => {
  switch (element.type) {
    case "AccessorProperty":
    case "TSAbstractAccessorProperty":
      return ["accessor-property"];
    case "MethodDefinition":
    case "TSAbstractMethodDefinition":
      return computeMethodSelectors(element.kind);
    default:
      return element.value?.type === "ArrowFunctionExpression" || element.value?.type === "FunctionExpression"
        ? ["function-property", "property"]
        : ["property"];
  }
};

// Only the modifiers the default groups name, a private member being one whether it has a hash or the keyword
const computeModifiers = (
  isStatic: boolean,
  accessibility: ESTree.PropertyDefinition["accessibility"],
  hasPrivateHash: boolean,
): string[] => {
  const modifiers = isStatic ? ["static"] : [];
  if (hasPrivateHash || accessibility === "private") return [...modifiers, "private"];
  return accessibility === "protected" ? [...modifiers, "protected"] : modifiers;
};

const toSortingClassMember = ({
  dependencyNames,
  element,
  evaluated,
  isStatic,
  modifiers,
  name,
  selectors,
}: {
  dependencyNames: string[];
  element: ESTree.ClassElement;
  evaluated?: ESTree.Node;
  isStatic: boolean;
  modifiers: string[];
  name: string;
  selectors: string[];
}): SortingClassMember => {
  const group = computeClassMemberGroup(selectors, modifiers);
  return {
    dependencies: [],
    dependencyNames,
    ...withEvaluated(evaluated),
    group,
    groupIndex: CLASS_MEMBER_GROUPS.findIndex((entry) => [entry].flat().includes(group)),
    isOxlintDisabled: false,
    isStatic,
    name,
    node: element,
    value: "",
  };
};

const buildMember = (sourceCode: SourceCode, element: ESTree.ClassElement): SortingClassMember => {
  if (element.type === "StaticBlock")
    return toSortingClassMember({
      dependencyNames: [],
      element,
      evaluated: element,
      isStatic: true,
      modifiers: [],
      name: "static",
      selectors: ["static-block"],
    });
  if (element.type === "TSIndexSignature")
    return toSortingClassMember({
      dependencyNames: [],
      element,
      isStatic: false,
      modifiers: [],
      name: sourceCode.text.slice(element.range[0], element.typeAnnotation.range[0]),
      selectors: ["index-signature"],
    });
  const { bareName, hasPrivateHash, name } = computeKeyName(sourceCode, element.key);
  const isStatic = element.static;
  // A property and an accessor are the members other members read, a method is not
  const isReadable =
    element.type === "PropertyDefinition" ||
    element.type === "TSAbstractPropertyDefinition" ||
    element.type === "AccessorProperty" ||
    element.type === "TSAbstractAccessorProperty";
  return toSortingClassMember({
    dependencyNames: isReadable ? [`${isStatic ? "static " : ""}${hasPrivateHash ? "#" : ""}${bareName}`] : [],
    element,
    ...withEvaluated(
      (element.type === "PropertyDefinition" || element.type === "AccessorProperty") && element.value
        ? element.value
        : undefined,
    ),
    isStatic,
    modifiers: computeModifiers(isStatic, element.accessibility, hasPrivateHash),
    name,
    selectors: computeKeyedSelectors(element),
  });
};

// Sorts a class's members as perfectionist's sort-classes does with its defaults: by group, then by name, and each
// Member after the members it reads. A method neither reads nor is read, and a field whose initialiser runs code keeps
// Its place, since fields and static blocks run in the order the source gives them
const sortClasses: Rule = defineRule({
  create(context) {
    return {
      ClassBody(node) {
        const elements = node.body.filter((element) => KNOWN_ELEMENT_TYPES.has(element.type));
        if (elements.length < 2) return;
        const members = elements.map((element) => buildMember(context.sourceCode, element));
        reportUnsortedByGroup(context, populateClassMemberDependencies(node, members));
      },
    };
  },
  meta: { fixable: "code", type: "suggestion" },
});

export default sortClasses;
