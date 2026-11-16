import type { SigV4Credentials } from "#src/models/sigv4/SigV4Credentials";

import { SIGV4_SCOPE_TERMINATOR } from "#src/services/sigv4/constants";

// The day, region and service a signature is scoped to, which the signing key is derived for
export const getCredentialScope = (
  { region, service }: Pick<SigV4Credentials, "region" | "service">,
  amzDate: string,
): string => `${amzDate.slice(0, 8)}/${region}/${service}/${SIGV4_SCOPE_TERMINATOR}`;
