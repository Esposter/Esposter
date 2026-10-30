import { InvalidOperationError, Operation } from "@esposter/shared";

// Whether the Oodle patch still has to be applied to a checkout. A tree that already carries it is left as it is, which
// its reverse applying shows; a tree the patch neither applies to nor reverses from is not the pinned commit
export const checkIsOodlePatchPending = ({
  appliesForward,
  appliesReverse,
}: {
  appliesForward: boolean;
  appliesReverse: boolean;
}): boolean => {
  if (appliesReverse) return false;
  if (appliesForward) return true;
  throw new InvalidOperationError(
    Operation.Update,
    "OodleHelper.cs",
    "is neither the pinned commit nor the patched one",
  );
};
