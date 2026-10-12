// The `WWW-Authenticate` challenge for a realm.
// The realm is a quoted string, so its quote and backslash are escaped.
// A realm therefore cannot close its own quotes to add a parameter of its own.
export const serializeBasicAuthChallenge = (realm: string): string =>
  `Basic realm="${realm.replaceAll(/["\\]/gu, String.raw`\$&`)}"`;
