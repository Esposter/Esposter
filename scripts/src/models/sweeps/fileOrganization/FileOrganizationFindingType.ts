export const FileOrganizationFindingType = {
  ExportsPerFile: "exports",
  FunctionsPerFile: "functions",
  LocalType: "local type",
  TypeOutsideModels: "type outside models",
} as const;
export type FileOrganizationFindingType =
  (typeof FileOrganizationFindingType)[keyof typeof FileOrganizationFindingType];
