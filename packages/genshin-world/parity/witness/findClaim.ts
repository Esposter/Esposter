export const findClaim = (claims: readonly [string, RegExp][], renderer: string): string | undefined =>
  claims.find(([, regex]) => regex.test(renderer))?.[0];
