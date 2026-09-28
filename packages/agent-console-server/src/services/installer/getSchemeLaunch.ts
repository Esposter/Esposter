import type { SchemeLaunch } from "#src/models/installer/SchemeLaunch";

import { HOST_SCHEME, PAIRING_CODE_PARAMETER } from "#src/services/constants";

// What an `esposter-host://` link asked for when Windows started the host with it: an argument that is not such a
// Link is an ordinary command-line start
export const getSchemeLaunch = (argument: string): SchemeLaunch | undefined => {
  if (!URL.canParse(argument)) return undefined;
  const url = new URL(argument);
  if (url.protocol !== `${HOST_SCHEME}:`) return undefined;
  return { code: url.searchParams.get(PAIRING_CODE_PARAMETER) ?? "" };
};
