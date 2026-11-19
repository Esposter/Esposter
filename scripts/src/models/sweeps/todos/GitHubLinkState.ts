// The states GitHub's GraphQL API gives an issue or a pull request, as it spells them
export const GitHubLinkState = { Closed: "CLOSED", Merged: "MERGED", Open: "OPEN" } as const;
export type GitHubLinkState = (typeof GitHubLinkState)[keyof typeof GitHubLinkState];
