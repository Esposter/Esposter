// One row of `gh pr checks --json name,state,bucket,description`. `bucket` is gh's normalisation across a commit
// Status and a check run, which is why it is read before `state`.
export interface CheckStatus {
  bucket: string;
  description: string;
  name: string;
  state: string;
}
