/* oxlint-disable no-inferrable-types */
export const VIRRUN_SNAPSHOTS_DIRECTORY_NAME = "snapshots";
// Sibling of snapshots/: source-keyed prepare layers holding a framework's generated artifacts (e.g. Nuxt's .nuxt),
// Keyed by lockfile + source-tree hash + the resolved prepare step, so a source change invalidates exactly this
// Layer while the deps snapshot is untouched. Host-global for the same reason snapshots are — an overlay lower can't
// Nest inside the source tree.
export const VIRRUN_PREPARE_DIRECTORY_NAME = "prepare";
// Overlayfs layer names of a captured snapshot, under .virrun/snapshots/<lockfile-hash>/: `upper` is the
// Published layer that persists the post-install writes (and doubles as a read-only lower when forking);
// `work` is the empty scratch dir overlayfs requires alongside a writable upper. A capture run writes into
// Per-pid temps (`<name>.<pid>.tmp`) and renames the upper onto its final name as the atomic publish barrier.
export const VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME = "upper";
export const VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME = "work";
// The command captured into the warm snapshot to provision the sandbox's own dependency closure: a frozen
// Install of the lockfile. On Windows the sandbox is a Linux (WSL) guest installing via corepack's pnpm
// (the login PATH brings node + corepack, not necessarily a global pnpm); on Linux the caller's shell
// Already exposes pnpm, so it is invoked directly. See resolveSetupCommand. The sandbox installs at pnpm's own
// Linux default virtual-store-dir length — the win32 host's `.nuxt` (which baked host-length `.pnpm` paths) is no
// Longer read in-sandbox: the prepare layer regenerates a Linux `.nuxt` that shadows it.
export const SETUP_COMMAND_WIN32 = "corepack pnpm install --frozen-lockfile";
export const SETUP_COMMAND_LINUX = "pnpm install --frozen-lockfile";
// Linux-side fs primitives for write-back (specs/write-back.md → "Execution locus"); classification + ordering stay
// In tested TS. python3 over getfattr — it reads the opaque xattr and walks in one ubiquitous tool.
// PROBE (argv: upperDir, snapshotDir) emits a JSON manifest of raw facts per upper entry, including whether each
// Path is supplied by the snapshot lower (a dep-tree write to skip), validated by zod in parseOverlayManifest.
export const OVERLAY_PROBE_SCRIPT = `
import json, os, stat, sys
up = sys.argv[1]
snapshot = sys.argv[2] if len(sys.argv) > 2 else ""
entries = []
for root, _dirs, _files in os.walk(up):
    for name in _dirs + _files:
        path = os.path.join(root, name)
        rel = os.path.relpath(path, up).replace(os.sep, "/")
        st = os.lstat(path)
        is_dir = stat.S_ISDIR(st.st_mode)
        is_opaque = False
        if is_dir:
            try:
                is_opaque = os.getxattr(path, "user.overlay.opaque", follow_symlinks=False) == b"y"
            except OSError:
                is_opaque = False
        is_lower = bool(snapshot) and os.path.lexists(os.path.join(snapshot, *rel.split("/")))
        entries.append({
            "isCharacterDevice": stat.S_ISCHR(st.st_mode),
            "isDirectory": is_dir,
            "isOpaque": is_opaque,
            "isSnapshotLowerPath": is_lower,
            "rdev": st.st_rdev,
            "relativePath": rel,
        })
json.dump(entries, sys.stdout)
`;
// APPLY (argv: upperDir, hostDir; stdin: the ordered FlushOp[] as JSON) reconciles the plan onto the host working
// Dir: a delete removes the host path; a copy recreates a symlink, mkdirs a directory (children arrive as their own
// Copies), or copy2's a file (preserving mode). The plan's deletes-before-copies, parent-first ordering is enforced
// By buildFlushPlan, so apply just executes in order.
export const OVERLAY_APPLY_SCRIPT = `
import json, os, shutil, sys
up, host = sys.argv[1], sys.argv[2]
for op in json.load(sys.stdin):
    dest = os.path.join(host, *op["relativePath"].split("/"))
    if op["type"] == "delete":
        if os.path.islink(dest) or os.path.isfile(dest):
            os.remove(dest)
        elif os.path.isdir(dest):
            shutil.rmtree(dest)
        continue
    src = os.path.join(up, *op["relativePath"].split("/"))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    # A pre-existing symlink at dest must go first: os.path.isdir/isfile follow links, so a dir/file copy onto a
    # Host symlink would otherwise write *through* it and escape hostDir. After this every isdir(dest) below is honest.
    if os.path.islink(dest):
        os.remove(dest)
    if os.path.islink(src):
        os.symlink(os.readlink(src), dest)
    elif os.path.isdir(src):
        if os.path.lexists(dest) and not os.path.isdir(dest):
            os.remove(dest)
        os.makedirs(dest, exist_ok=True)
        shutil.copystat(src, dest)
    else:
        if os.path.isdir(dest):
            shutil.rmtree(dest)
        shutil.copy2(src, dest)
`;
