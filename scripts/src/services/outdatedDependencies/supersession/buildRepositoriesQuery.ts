import { getRepositoryAlias } from "#src/services/outdatedDependencies/supersession/getRepositoryAlias";

// One GraphQL request naming each `owner/repo` as an aliased field, which GitHub follows to a renamed repository's name
export const buildRepositoriesQuery = (repositories: string[]): string => {
  const fields = repositories.map((repository, index) => {
    const [owner = "", name = ""] = repository.split("/");

    return `${getRepositoryAlias(index)}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { nameWithOwner isArchived }`;
  });

  return `query { ${fields.join(" ")} }`;
};
