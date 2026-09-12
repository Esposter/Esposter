// The tag of a pid-tagged temp FILE, `<pid>.<uuid>`: the same shape withPidTempPrefix hands mkdtemp for a directory,
// With the random half supplied here because a file has no mkdtemp to supply it. Read back apart by parseTempOwnerPid,
// So the two are one contract. A planner that stages several temps under one tag (createWslSourceMirrorSync) calls
// It once and prefixes each.
export const createPidTempTag = (): string => `${process.pid}.${crypto.randomUUID()}`;
