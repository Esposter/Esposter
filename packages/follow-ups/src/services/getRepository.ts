// A repository as `owner/name` from its origin remote, the form it has from every clone and machine, whether the remote
// Is an https url or an ssh one; "" for a remote that names no such pair
export const getRepository = (remoteUrl: string): string =>
  /[/:](?<repository>[\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/u.exec(remoteUrl.trim())?.groups?.repository ?? "";
