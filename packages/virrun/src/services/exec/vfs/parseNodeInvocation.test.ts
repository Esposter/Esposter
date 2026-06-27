import { parseNodeInvocation } from "@/services/exec/vfs/parseNodeInvocation";
import { describe, expect, test } from "vitest";

describe(parseNodeInvocation, () => {
  test("parses a -e string command into its inline code", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation('node -e "process.exit(0)"')).toStrictEqual({ code: "process.exit(0)", file: "" });
  });

  test("parses the --eval alias", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation('node --eval "process.exit(0)"')).toStrictEqual({ code: "process.exit(0)", file: "" });
  });

  test("parses an argv form unchanged", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation(["node", "-e", "process.exit(0)"])).toStrictEqual({ code: "process.exit(0)", file: "" });
  });

  test("parses a file run into its file path", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation("node index.js")).toStrictEqual({ code: "", file: "index.js" });
  });

  test("returns undefined for an empty file token", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation(["node", ""])).toBeUndefined();
  });

  test("returns undefined for a non-node command", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation("ls -e x")).toBeUndefined();
  });

  test("returns undefined for a file run with script args (not emulated yet)", () => {
    expect.hasAssertions();

    expect(parseNodeInvocation("node index.js --flag")).toBeUndefined();
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
