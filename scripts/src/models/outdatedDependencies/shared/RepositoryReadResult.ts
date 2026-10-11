// A repository as GitHub serves it now, or the reason it could not be read
export type RepositoryReadResult = { error: string } | { fullName: string; isArchived: boolean };
