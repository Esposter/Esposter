// The refusal a node gets when its type is none of the accepted types.
// It lists the accepted types as the slot or the root gives them.
export const getAcceptedTypesMessage = (acceptedTypes: readonly string[]): string =>
  `type must be one of ${acceptedTypes.join(", ")}`;
