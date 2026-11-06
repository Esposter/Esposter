// The refusal a node of a type none of the accepted types names is given, listing the accepted types as the slot or the root gives them
export const getAcceptedTypesMessage = (acceptedTypes: readonly string[]): string =>
  `type must be one of ${acceptedTypes.join(", ")}`;
