import type { SortingClassMember } from "#src/models/oxlint/sorting/SortingClassMember";
import type { ESTree } from "@oxlint/plugins";

import { collectNodes } from "#src/services/oxlint/errorHandling/collectNodes";
import { checkIsNodeInsideDeferredFunction } from "#src/services/oxlint/sorting/checkIsNodeInsideDeferredFunction";

// A static block reads everything it names, and any other member reads only outside the deferred functions in it
const checkIsDeferredRead = (reference: ESTree.Node, member: SortingClassMember): boolean =>
  member.node.type !== "StaticBlock" && checkIsNodeInsideDeferredFunction(reference, member.node);

// The name a member read names: a private name with its hash, a non-computed identifier, or a literal's value.
// A computed identifier is a variable, not a member, and any other property names none.
const computeReadName = (member: ESTree.MemberExpression): string | undefined => {
  const { property } = member;
  if (property.type === "PrivateIdentifier") return `#${property.name}`;
  if (property.type === "Identifier") return member.computed ? undefined : property.name;
  if (property.type === "Literal") return String(property.value);
  return undefined;
};

// The first candidate a read of `reference` names; none when the read is deferred or is not a member's object
const findReadProviders = (
  member: SortingClassMember,
  reference: ESTree.Node,
  candidates: SortingClassMember[],
): SortingClassMember[] => {
  if (checkIsDeferredRead(reference, member)) return [];
  const { parent } = reference;
  if (parent?.type !== "MemberExpression" || parent.object !== reference) return [];
  const readName = computeReadName(parent);
  const provider = candidates.find((candidate) => candidate.name === readName);
  return provider ? [provider] : [];
};

// Each member's dependencies are the members it reads through the class's own name or through `this`.
// A name reads the static members, and `this` reads the members of its own staticness. A method reads nothing.
export const populateClassMemberDependencies = (
  classBody: ESTree.ClassBody,
  members: SortingClassMember[],
): SortingClassMember[] => {
  const { parent } = classBody;
  const className =
    parent.type === "ClassDeclaration" || parent.type === "ClassExpression" ? parent.id?.name : undefined;
  const staticMembers = members.filter((member) => member.isStatic);
  const instanceMembers = members.filter((member) => !member.isStatic);
  return members.map((member) => {
    if (member.node.type === "MethodDefinition" || member.node.type === "TSIndexSignature")
      return { ...member, dependencies: [] };
    const nodes = collectNodes(member.node);
    const classNameProviders = nodes.flatMap((node) =>
      className !== undefined && node.type === "Identifier" && node.name === className
        ? findReadProviders(member, node, staticMembers)
        : [],
    );
    const thisCandidates = member.isStatic ? staticMembers : instanceMembers;
    const thisProviders = nodes.flatMap((node) =>
      node.type === "ThisExpression" ? findReadProviders(member, node, thisCandidates) : [],
    );
    return {
      ...member,
      dependencies: [...classNameProviders, ...thisProviders].flatMap((provider) => provider.dependencyNames),
    };
  });
};
