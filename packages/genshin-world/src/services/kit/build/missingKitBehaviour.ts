import { InvalidOperationError, Operation } from "@esposter/shared";

// What a kit's record leaves its behaviour to give, a party heal's chance or a variant's check, until the behaviour gives
// It: building the kit fails where it is still missing, and it fails if it is ever called
export const missingKitBehaviour = (): never => {
  throw new InvalidOperationError(Operation.Read, missingKitBehaviour.name, "its kit's behaviour gives none");
};
