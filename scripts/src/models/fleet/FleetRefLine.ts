// One line of `git for-each-ref --format='%(objectname) %(refname:lstrip=3) %(contents:subject)'`: the commit a ref
// Points at, the ref's last path segment, and its commit message's subject, which is the whole message for a claim
export interface FleetRefLine {
  id: string;
  message: string;
  sha: string;
}
