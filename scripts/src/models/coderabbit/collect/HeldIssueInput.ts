export interface HeldIssueInput {
  // The held branch just deleted
  branch: string;
  // The held branches still standing, any of which keeps the issue that lists it open
  heldBranches: Set<string>;
  // What the closing comment says brought the commit back
  note: string;
  viewerLogin: string;
}
