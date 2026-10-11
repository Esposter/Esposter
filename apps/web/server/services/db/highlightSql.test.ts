import { highlightSql } from "#server/services/db/highlightSql";
import { stripVTControlCharacters, styleText } from "node:util";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(highlightSql, () => {
  beforeEach(() => {
    vi.stubEnv("FORCE_COLOR", "1");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("colour is forced for these tests", () => {
    expect.hasAssertions();

    expect(styleText("magenta", "select", { validateStream: false })).not.toBe("select");
  });

  test.each([
    ["a Drizzle select", `select "users".* from "users" where "email" = 'test@gmail.com' and "is_banned" = true`],
    ["a Drizzle insert", `insert into "brands" ("name") values ($1) returning "id", "name"`],
    ["comments and numbers", "select count(*) from t -- note\n/* block */ where a >= 1.5e3"],
    ["doubled quotes and a backslash", String.raw`select 'it''s', 'a\' from t`],
    ["an unterminated string", "select 'abc"],
  ])("with colour stripped, %s is the input exactly", (_name, sql) => {
    expect.hasAssertions();

    expect(stripVTControlCharacters(highlightSql(sql))).toBe(sql);
  });

  test("paints a keyword, a number, a function and an operand, leaving the rest plain", () => {
    expect.hasAssertions();

    expect(highlightSql("select count(id) from users where id = 1")).toBe(
      `${styleText("magenta", "select")} ${styleText("blue", "count")}(id) ${styleText("magenta", "from")} users ${styleText("magenta", "where")} id = ${styleText("yellow", "1")}`,
    );
  });

  test("a keyword inside a string is not painted", () => {
    expect.hasAssertions();

    expect(highlightSql("select 'from where' from t")).toBe(
      `${styleText("magenta", "select")} ${styleText("green", "'from where'")} ${styleText("magenta", "from")} t`,
    );
  });

  test("a keyword inside a double-quoted identifier is not painted", () => {
    expect.hasAssertions();

    expect(highlightSql(`select "select" from t`)).toBe(
      `${styleText("magenta", "select")} ${styleText("blue", `"select"`)} ${styleText("magenta", "from")} t`,
    );
  });

  test("#4 paints a double-quoted identifier as an identifier, not a string", () => {
    expect.hasAssertions();

    expect(highlightSql(`SELECT "users".* FROM "users"`)).toBe(
      `${styleText("magenta", "SELECT")} ${styleText("blue", `"users"`)}.* ${styleText("magenta", "FROM")} ${styleText("blue", `"users"`)}`,
    );
  });

  test("#133 reads # as an operator, since Postgres has no # comment", () => {
    expect.hasAssertions();

    expect(highlightSql("select 5 # 3 from t")).toBe(
      `${styleText("magenta", "select")} ${styleText("yellow", "5")} # ${styleText("yellow", "3")} ${styleText("magenta", "from")} t`,
    );
  });

  test("#149 reads a minus after an operand as an operator, not as the sign of a number", () => {
    expect.hasAssertions();

    expect(highlightSql("select a-1 from t")).toBe(
      `${styleText("magenta", "select")} a-${styleText("yellow", "1")} ${styleText("magenta", "from")} t`,
    );
  });

  test("#153 ends a string at its quote, since a backslash is an ordinary character", () => {
    expect.hasAssertions();

    expect(highlightSql(String.raw`select 'a\' as x from t`)).toBe(
      `${styleText("magenta", "select")} ${styleText("green", String.raw`'a\'`)} ${styleText("magenta", "as")} x ${styleText("magenta", "from")} t`,
    );
  });

  test("a doubled quote stays inside one string", () => {
    expect.hasAssertions();

    expect(highlightSql("select 'it''s' from t")).toBe(
      `${styleText("magenta", "select")} ${styleText("green", "'it''s'")} ${styleText("magenta", "from")} t`,
    );
  });

  test("comments are painted in the muted style", () => {
    expect.hasAssertions();

    expect(highlightSql("select 1 -- note\nfrom t /* block */")).toBe(
      `${styleText("magenta", "select")} ${styleText("yellow", "1")} ${styleText(["gray", "dim", "italic"], "-- note")}\n${styleText("magenta", "from")} t ${styleText(["gray", "dim", "italic"], "/* block */")}`,
    );
  });

  test("#35 keywords are matched case-insensitively", () => {
    expect.hasAssertions();

    expect(highlightSql("Select * From t Where a Like 'x'")).toBe(
      `${styleText("magenta", "Select")} * ${styleText("magenta", "From")} t ${styleText("magenta", "Where")} a ${styleText("magenta", "Like")} ${styleText("green", "'x'")}`,
    );
  });

  test("#189 paints RETURNING as a keyword", () => {
    expect.hasAssertions();

    expect(highlightSql(`insert into "brands" ("name") values ('x') returning "id"`)).toContain(
      styleText("magenta", "returning"),
    );
  });

  test("#26 paints OVERLAPS as a keyword", () => {
    expect.hasAssertions();

    expect(highlightSql("select 1 where (a, b) overlaps (c, d)")).toContain(styleText("magenta", "overlaps"));
  });

  test("#60 keeps keywords after a schema-qualified name", () => {
    expect.hasAssertions();

    expect(highlightSql(`select 1 from "db"."t" where x = 1`)).toBe(
      `${styleText("magenta", "select")} ${styleText("yellow", "1")} ${styleText("magenta", "from")} ${styleText("blue", `"db"`)}.${styleText("blue", `"t"`)} ${styleText("magenta", "where")} x = ${styleText("yellow", "1")}`,
    );
  });

  test("#13 reads a decimal number as one number", () => {
    expect.hasAssertions();

    expect(highlightSql("select 42.11")).toBe(`${styleText("magenta", "select")} ${styleText("yellow", "42.11")}`);
  });

  test("a Postgres parameter is painted in the number style", () => {
    expect.hasAssertions();

    expect(highlightSql("select $1")).toBe(`${styleText("magenta", "select")} ${styleText("yellow", "$1")}`);
  });
});
