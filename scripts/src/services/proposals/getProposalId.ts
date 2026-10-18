import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";

// A change's id is its folder under the changes root, which every file of the change sits in
export const getProposalId = (path: string): string => {
  const [id = ""] = path.slice(PROPOSALS_DIRECTORY.length + 1).split("/");
  return id;
};
