import { parseSource } from "#src/services/shared/parseSource";

// The keys of a fixture's `variants` object, its top-level entries, listed without loading its component. The source is
// parsed rather than matched, since a variants object is written over many lines or on one, and each form reads the same
export const getFixtureVariantNames = (fixture: string): string[] => {
  const declarators = parseSource(fixture).body.flatMap((statement) =>
    statement.type === "ExportNamedDeclaration" && statement.declaration?.type === "VariableDeclaration"
      ? statement.declaration.declarations
      : [],
  );
  const initializer = declarators.find(
    (declarator) => declarator.id.type === "Identifier" && declarator.id.name === "variants",
  )?.init;
  if (initializer?.type !== "ObjectExpression") return [];
  return initializer.properties.flatMap((property) =>
    property.type === "Property" && property.key.type === "Identifier" ? [property.key.name] : [],
  );
};
