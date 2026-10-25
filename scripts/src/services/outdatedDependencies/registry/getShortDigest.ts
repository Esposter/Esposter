// A digest's first seven hex characters, as git abbreviates a commit, which tell two digests apart in a table
export const getShortDigest = (digest: string): string => digest.replace(/^sha256:/u, "").slice(0, 7);
