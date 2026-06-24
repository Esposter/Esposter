import { parseNodeInvocation } from "@/services/exec/parseNodeInvocation";
import { describe, expect, test } from "vitest";

describe(parseNodeInvocation, () => {
  test("parses a -e string command into its inline code", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation('node -e "process.exit(0)"')).toStrictEqual({ code: "process.exit(0)" });
  });

  test("parses the --eval alias", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation('node --eval "process.exit(0)"')).toStrictEqual({ code: "process.exit(0)" });
  });

  test("parses an argv form unchanged", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation(["node", "-e", "process.exit(0)"])).toStrictEqual({ code: "process.exit(0)" });
  });

  test("returns undefined for a non-node command", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation("ls -e x")).toBeUndefined();
  });

  test("returns undefined for a file run (Step B2)", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation("node index.js")).toBeUndefined();
  });

  test("returns undefined for an unsupported flag", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation('node -p "1"')).toBeUndefined();
  });

  test("returns undefined when shell metacharacters need a real shell", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation('node -e "process.exit(0)" | cat')).toBeUndefined();
  });

  test("returns undefined on an unbalanced quote", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation('node -e "process.exit(0)')).toBeUndefined();
  });
});
