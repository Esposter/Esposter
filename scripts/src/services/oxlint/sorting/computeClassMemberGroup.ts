import { CLASS_MEMBER_GROUPS, SELECTORS } from "#src/services/oxlint/sorting/classMemberGroups";
import { parsePredefinedGroup } from "#src/services/oxlint/sorting/computeClassMemberGroup/parsePredefinedGroup";

// The predefined groups in the order a member is matched against them: the most specific selector first.
// Then the group naming the most modifiers, since the default groups never tie on both.
const PREDEFINED_GROUPS = CLASS_MEMBER_GROUPS.flat()
  .flatMap((name) => {
    const predefinedGroup = parsePredefinedGroup(name);
    return predefinedGroup ? [predefinedGroup] : [];
  })
  .toSorted(
    (left, right) =>
      SELECTORS.indexOf(left.selector) - SELECTORS.indexOf(right.selector) ||
      right.modifiers.length - left.modifiers.length,
  );

// A member's group is the first predefined group whose selector it carries and whose modifiers it all has
export const computeClassMemberGroup = (selectors: string[], modifiers: string[]): string =>
  PREDEFINED_GROUPS.find(
    (predefinedGroup) =>
      selectors.includes(predefinedGroup.selector) &&
      predefinedGroup.modifiers.every((modifier) => modifiers.includes(modifier)),
  )?.name ?? "unknown";
