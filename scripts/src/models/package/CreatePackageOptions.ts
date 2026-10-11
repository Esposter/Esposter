import type { PackageKind } from "#src/models/package/PackageKind";

export interface CreatePackageOptions {
  description: string;
  kind: PackageKind;
  name: string;
  register: boolean;
}
