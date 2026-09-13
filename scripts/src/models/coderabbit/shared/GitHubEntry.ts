// The fields every REST comment and review payload shares. `updated_at` and `user` keep GitHub's own spelling,
// Which the API forces: renaming them would mean rewriting each payload before anything could read it.
export interface GitHubEntry {
  body: string;
  id: number;
  updated_at: string;
  user: { login: string };
}
