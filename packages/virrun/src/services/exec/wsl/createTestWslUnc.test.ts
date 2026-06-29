import { TEST_WSL_DISTRO, TEST_WSL_UNC_PREFIX } from "@/services/exec/wsl/constants.test";
import { describe } from "vitest";
// Builds the Windows UNC that addresses a Linux path inside the test distro — the inverse of readWslPath:
// Prefix + distro + the path with separators flipped (an empty path yields the bare distro-root UNC). The
// Prefix is overridable so the legacy `\\wsl$\` form can be exercised alongside `\\wsl.localhost\`.
export const createTestWslUnc = (linuxPath: string, prefix: string = TEST_WSL_UNC_PREFIX): string =>
  `${prefix}\\${TEST_WSL_DISTRO}${linuxPath.replaceAll("/", "\\")}`;

describe.todo("createTestWslUnc");
