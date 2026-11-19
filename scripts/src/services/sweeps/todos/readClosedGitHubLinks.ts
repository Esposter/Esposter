import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// GitHub's answer for each aliased link: an issue or pull request carries its state, anything else carries none, and a
// Url with no record at all is `null`, GitHub's own absent form kept inside this boundary shape
const linksResponseSchema = z.object({
  data: z.record(z.string(), z.object({ state: z.enum(["CLOSED", "MERGED", "OPEN"]).optional() }).nullable()),
});
// The links whose issue or pull request upstream has closed or merged, read in one GraphQL request with each url
// Aliased by its index, since a request per link would cost a round trip each
export const readClosedGitHubLinks = (urls: string[]): Set<string> => {
  if (urls.length === 0) return new Set();

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

  return new Set(
    urls.filter((_url, index) => {
      const state = response.data.data[`link${index}`]?.state;
      return state === "CLOSED" || state === "MERGED";
    }),
  );
};
