// The committed file a reference's softness is held as, named by the digest of the reference it measures
export const getSoftnessFileName = (referenceId: string, digest: string): string =>
  `${referenceId}.softness-${digest}.txt`;
