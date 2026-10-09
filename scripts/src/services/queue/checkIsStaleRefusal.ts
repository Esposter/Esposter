// The two refusals git gives a push whose remote ref moved past what the push was built on: the remote's new tip is one
// The local branch is not ahead of (`non-fast-forward`), or one the local clone has not fetched (`fetch first`)
export const checkIsStaleRefusal = (message: string): boolean => /\((?:non-fast-forward|fetch first)\)/u.test(message);
