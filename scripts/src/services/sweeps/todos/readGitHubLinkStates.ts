import { GitHubLinkState } from "#src/models/sweeps/todos/GitHubLinkState";
import { TodoLinkState } from "#src/models/sweeps/todos/TodoLinkState";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// GitHub's answer for each aliased link: an issue or pull request carries its state, anything else carries none, and a
// Url with no record at all is `null`, GitHub's own absent form kept inside this boundary shape
const linksResponseSchema = z.object({
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- GitHub's GraphQL answers a url with no record as `null`, an external boundary's own absent form
  data: z.record(z.string(), z.object({ state: z.enum(GitHubLinkState).optional() }).nullable()),
});
const LinkStateMap = {
  [GitHubLinkState.Closed]: TodoLinkState.Closed,
  [GitHubLinkState.Merged]: TodoLinkState.Merged,
  [GitHubLinkState.Open]: TodoLinkState.Open,
} as const satisfies Record<GitHubLinkState, TodoLinkState>;
// Every GitHub link's state in one GraphQL request, each url aliased by its index, since a request per link would cost
// A round trip each. A link with no issue or pull request behind it is unchecked
export const readGitHubLinkStates = (urls: string[]): Map<string, TodoLinkState> => {
  if (urls.length === 0) return new Map();

  const fields = urls.map(
    (url, index) =>
      `link${index}: resource(url: ${JSON.stringify(url)}) { ... on Issue { state } ... on PullRequest { state } }`,
  );
  const response = linksResponseSchema.safeParse(
    parseMachineJson(runGh(["api", "graphql", "-f", `query=query { ${fields.join(" ")} }`])),
  );
  if (!response.success)
    throw new InvalidOperationError(
      Operation.Read,
      "GitHub link states",
      `the response does not parse: ${response.error.message}`,
    );

  return new Map(
    urls.map((url, index) => {
      const state = response.data.data[`link${index}`]?.state;
      return [url, state === undefined ? TodoLinkState.Unchecked : LinkStateMap[state]];
    }),
  );
};
