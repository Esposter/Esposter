// The response of a GraphQL request naming repositories as aliased fields: a field GitHub cannot resolve is null and
// Carries its reason among `errors`, under the field's alias
export interface RepositoriesResponse {
  data?: Record<string, { isArchived: boolean; nameWithOwner: string } | null>;
  errors?: { message: string; path?: (number | string)[] }[];
}
