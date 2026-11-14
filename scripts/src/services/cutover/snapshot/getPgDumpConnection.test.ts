import { getPgDumpConnection } from "#src/services/cutover/snapshot/getPgDumpConnection";
import { describe, expect, test } from "vitest";

describe(getPgDumpConnection, () => {
  test("passes the password through the environment and keeps it off the command line", () => {
    expect.hasAssertions();

    const connection = getPgDumpConnection("postgresql://reader:p%40ss@db.example.com:5432/esposter?sslmode=require");

    expect(connection.environment).toStrictEqual({ PGPASSWORD: "p@ss", PGSSLMODE: "require" });
    expect(connection.args.join(" ")).not.toContain("p@ss");
    expect(connection.args).toContain("esposter");
  });
});
