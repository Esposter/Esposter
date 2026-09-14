export const getMockSasUrl = (
  url: string,
  permissions: undefined | { toString: () => string },
  resourceType?: string,
): string =>
  `${url}?sv=2025-11-05&${resourceType ? `sr=${resourceType}&` : ""}sig=mock-signature&st=1970-01-01T00:00:00Z&se=2099-12-31T23:59:59Z&sp=${permissions?.toString() ?? "r"}`;
