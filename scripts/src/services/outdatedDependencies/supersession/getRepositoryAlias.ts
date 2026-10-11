// The alias a repository is read back under, by its position in the request that names it
export const getRepositoryAlias = (index: number): string => `r${index}`;
