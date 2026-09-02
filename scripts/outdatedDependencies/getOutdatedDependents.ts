export const getOutdatedDependents = (dependentPackages: unknown): string[] => {
  if (!Array.isArray(dependentPackages)) return [];

  return dependentPackages.flatMap((dependentPackage) =>
    dependentPackage && typeof dependentPackage === "object" && typeof dependentPackage.name === "string"
      ? [dependentPackage.name]
      : [],
  );
};
