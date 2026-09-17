import { WINDOWS_DRIVE_MOUNT_REGEX, WSL_PATH_DELIMITER } from "#src/services/exec/wsl/constants";
// The captured login PATH reduced to what a Linux sandbox can actually resolve: every Windows drive mount dropped
// (WINDOWS_DRIVE_MOUNT_REGEX states why each one is unusable), everything else kept in order. Applied at capture, so
// The persisted value is already the sandbox's PATH and no consumer has to know the capture came through interop.
//
// Dropping rather than reordering: an entry that can only answer with a win32 binary has no position on this PATH at
// Which it is the right answer, and leaving it last still lets it answer for a Linux binary the distro lacks — the
// Failure this whole rule exists to make impossible, since that answer is a Windows executable the sandbox then runs
// As if it were the toolchain. What the repo's own binaries need instead is named outright by createOsExecOptions.
export const getSandboxLoginPath = (capturedPath: string): string =>
  capturedPath
    .split(WSL_PATH_DELIMITER)
    .filter((entry) => !WINDOWS_DRIVE_MOUNT_REGEX.test(entry))
    .join(WSL_PATH_DELIMITER);
