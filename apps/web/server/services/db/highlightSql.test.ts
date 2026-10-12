import { HighlightStyleMap } from "#server/services/db/constants";
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

    expect(styleText(HighlightStyleMap.keyword, "select", { validateStream: false })).not.toBe("select");
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
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.function, "count")}(id) ${styleText(HighlightStyleMap.keyword, "from")} users ${styleText(HighlightStyleMap.keyword, "where")} id = ${styleText(HighlightStyleMap.number, "1")}`,
    );
  });

  test("a keyword inside a string is not painted", () => {
    expect.hasAssertions();

    expect(highlightSql("select 'from where' from t")).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.string, "'from where'")} ${styleText(HighlightStyleMap.keyword, "from")} t`,
    );
  });

  test("a backslash escape in an E-string keeps its escaped quote inside the string", () => {
    expect.hasAssertions();

    expect(highlightSql(String.raw`select E'it\'s' from t`)).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.string, String.raw`E'it\'s'`)} ${styleText(HighlightStyleMap.keyword, "from")} t`,
    );
  });

  test("a keyword inside a double-quoted identifier is not painted", () => {
    expect.hasAssertions();

    expect(highlightSql(`select "select" from t`)).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.identifier, `"select"`)} ${styleText(HighlightStyleMap.keyword, "from")} t`,
    );
  });

  test("#4 paints a double-quoted identifier as an identifier, not a string", () => {
    expect.hasAssertions();

    expect(highlightSql(`SELECT "users".* FROM "users"`)).toBe(
      `${styleText(HighlightStyleMap.keyword, "SELECT")} ${styleText(HighlightStyleMap.identifier, `"users"`)}.* ${styleText(HighlightStyleMap.keyword, "FROM")} ${styleText(HighlightStyleMap.identifier, `"users"`)}`,
    );
  });

  test("#133 reads # as an operator, since Postgres has no # comment", () => {
    expect.hasAssertions();

    expect(highlightSql("select 5 # 3 from t")).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.number, "5")} # ${styleText(HighlightStyleMap.number, "3")} ${styleText(HighlightStyleMap.keyword, "from")} t`,
    );
  });

  test("#149 reads a minus after an operand as an operator, not as the sign of a number", () => {
    expect.hasAssertions();

    expect(highlightSql("select a-1 from t")).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} a-${styleText(HighlightStyleMap.number, "1")} ${styleText(HighlightStyleMap.keyword, "from")} t`,
    );
  });

  test("#153 ends a string at its quote, since a backslash is an ordinary character", () => {
    expect.hasAssertions();

    expect(highlightSql(String.raw`select 'a\' as x from t`)).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.string, String.raw`'a\'`)} ${styleText(HighlightStyleMap.keyword, "as")} x ${styleText(HighlightStyleMap.keyword, "from")} t`,
    );
  });

  test("a doubled quote stays inside one string", () => {
    expect.hasAssertions();

    expect(highlightSql("select 'it''s' from t")).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.string, "'it''s'")} ${styleText(HighlightStyleMap.keyword, "from")} t`,
    );
  });

  test("comments are painted in the muted style", () => {
    expect.hasAssertions();

    expect(highlightSql("select 1 -- note\nfrom t /* block */")).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.number, "1")} ${styleText(HighlightStyleMap.comment, "-- note")}\n${styleText(HighlightStyleMap.keyword, "from")} t ${styleText(HighlightStyleMap.comment, "/* block */")}`,
    );
  });

  test("#35 keywords are matched case-insensitively", () => {
    expect.hasAssertions();

    expect(highlightSql("Select * From t Where a Like 'x'")).toBe(
      `${styleText(HighlightStyleMap.keyword, "Select")} * ${styleText(HighlightStyleMap.keyword, "From")} t ${styleText(HighlightStyleMap.keyword, "Where")} a ${styleText(HighlightStyleMap.keyword, "Like")} ${styleText(HighlightStyleMap.string, "'x'")}`,
    );
  });

  test("#189 paints RETURNING as a keyword", () => {
    expect.hasAssertions();

    expect(highlightSql(`insert into "brands" ("name") values ('x') returning "id"`)).toContain(
      styleText(HighlightStyleMap.keyword, "returning"),
    );
  });

  test("#26 paints OVERLAPS as a keyword", () => {
    expect.hasAssertions();

    expect(highlightSql("select 1 where (a, b) overlaps (c, d)")).toContain(
      styleText(HighlightStyleMap.keyword, "overlaps"),
    );
  });

  test("#60 keeps keywords after a schema-qualified name", () => {
    expect.hasAssertions();

    expect(highlightSql(`select 1 from "db"."t" where x = 1`)).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.number, "1")} ${styleText(HighlightStyleMap.keyword, "from")} ${styleText(HighlightStyleMap.identifier, `"db"`)}.${styleText(HighlightStyleMap.identifier, `"t"`)} ${styleText(HighlightStyleMap.keyword, "where")} x = ${styleText(HighlightStyleMap.number, "1")}`,
    );
  });

  test("#13 reads a decimal number as one number", () => {
    expect.hasAssertions();

    expect(highlightSql("select 42.11")).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.number, "42.11")}`,
    );
  });

  test("a Postgres parameter is painted in the number style", () => {
    expect.hasAssertions();

    expect(highlightSql("select $1")).toBe(
      `${styleText(HighlightStyleMap.keyword, "select")} ${styleText(HighlightStyleMap.parameter, "$1")}`,
    );
  });
});
