import { setLockfileNodeVersion } from "#src/services/updateNode/setLockfileNodeVersion";
import { describe, expect, test } from "vitest";

describe(setLockfileNodeVersion, () => {
  test("rewrites the root entry's engines.node and leaves a dependency's engines.node alone", () => {
    expect.hasAssertions();

    const lockfile = [
      "{",
      '  "packages": {',
      '    "": {',
      '      "engines": {',
      '        "node": ">=0.0.0"',
      "      }",
      "    },",
      '    "node_modules/a": {',
      '      "engines": {',
      '        "node": ">=0.0.0"',
      "      }",
      "    }",
      "  }",
      "}",
    ];
    const updatedLockfile = [
      "{",
      '  "packages": {',
      '    "": {',
      '      "engines": {',
      '        "node": ">=1.0.0"',
      "      }",
      "    },",
      '    "node_modules/a": {',
      '      "engines": {',
      '        "node": ">=0.0.0"',
      "      }",
      "    }",
      "  }",
      "}",
    ];

    expect(setLockfileNodeVersion(lockfile.join("\n"), "1.0.0")).toBe(updatedLockfile.join("\n"));
  });
});
