// A mock signature is valid to the end of 2099 unless the caller names the moment its address lapses
const MOCK_SAS_FAR_FUTURE_EXPIRY = new Date("2099-12-31T23:59:59Z");

export const getMockSasUrl = (
  url: string,
  permissions: undefined | { toString: () => string },
  resourceType?: string,
  expiresOn: Date = MOCK_SAS_FAR_FUTURE_EXPIRY,
): string =>
  `${url}?sv=2025-11-05&${resourceType ? `sr=${resourceType}&` : ""}sig=mock-signature&st=1970-01-01T00:00:00Z&se=${expiresOn.toISOString().replace(/\.\d{3}Z$/u, "Z")}&sp=${permissions?.toString() ?? "r"}`;
