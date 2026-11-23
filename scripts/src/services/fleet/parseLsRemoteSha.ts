// `git ls-remote <remote> <ref>` prints `<sha>\t<ref>` for each ref it finds, so an empty output is a ref not there
export const parseLsRemoteSha = (output: string): string | undefined => {
  const sha = output.trim().split(/\s/u)[0];
  // eslint-disable-next-line no-restricted-syntax -- a sha git prints, empty when none
  return sha === undefined || sha === "" ? undefined : sha;
};
