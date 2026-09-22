import type { FileOrganizationFindingType } from "#src/models/sweeps/fileOrganization/FileOrganizationFindingType";

export interface FileOrganizationFinding {
  names: string[];
  path: string;
  type: FileOrganizationFindingType;
}
