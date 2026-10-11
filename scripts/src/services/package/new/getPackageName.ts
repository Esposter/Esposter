import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { PLUGIN_SCOPE } from "#src/services/package/new/constants";

// A published package keeps its bare npm name; a private plugin takes the scope every private member carries
export const getPackageName = ({ kind, name }: CreatePackageOptions): string =>
  kind === PackageKind.Plugin ? `${PLUGIN_SCOPE}/${name}` : name;
