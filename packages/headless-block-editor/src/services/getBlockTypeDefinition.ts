// The registry's definition of a block type, or undefined when the registry does not hold the type
export const getBlockTypeDefinition = <TDefinition extends { type: string }>(
  registry: { types: TDefinition[] },
  type: string,
): TDefinition | undefined => registry.types.find((definition) => definition.type === type);
