import { dedent } from "#src/util/text/dedent";
import { describe, expect, test } from "vitest";

describe(dedent, () => {
  test("works without interpolation", () => {
    expect.hasAssertions();

    expect(dedent`first
       second
       third`).toBe("first\nsecond\nthird");
  });

  test("works with interpolation", () => {
    expect.hasAssertions();

    expect(dedent`first ${"line"}
       ${"second"}
       third`).toBe("first line\nsecond\nthird");
  });

  test("works with suppressed newlines", () => {
    expect.hasAssertions();

    expect(dedent`first \
       ${"second"}
       third`).toBe("first second\nthird");
  });

  test("works with blank first line", () => {
    expect.hasAssertions();

    expect(dedent`
      Some text that I might want to indent:
        * reasons
        * fun
      That's all.
    `).toBe("Some text that I might want to indent:\n  * reasons\n  * fun\nThat's all.");
  });

  test("works with multiple blank first lines", () => {
    expect.hasAssertions();

    expect(dedent`

       first
       second
       third`).toBe("first\nsecond\nthird");
  });

  test("works with removing same number of spaces", () => {
    expect.hasAssertions();

    expect(dedent`
         first
           second
             third
    `).toBe("first\n  second\n    third");
  });

  test("works with spaces for indentation", () => {
    expect.hasAssertions();

    expect(dedent`
      first
        second
          third
      `).toBe("first\n  second\n    third");
  });

  test("works with tabs for indentation", () => {
    expect.hasAssertions();

    expect(dedent("\t\tfirst\n\t\t\tsecond\n\t\t\t\tthird")).toBe("first\n\tsecond\n\t\tthird");
  });

  test("single line input: works with single line input", () => {
    expect.hasAssertions();

    expect(dedent`A single line of input.`).toBe("A single line of input.");
  });

  test("single line input: works with single line and closing backtick on newline", () => {
    expect.hasAssertions();

    expect(dedent`
      A single line of input.
    `).toBe("A single line of input.");
  });

  test("single line input: works with single line and inline closing backtick", () => {
    expect.hasAssertions();

    expect(dedent`
      A single line of input.`).toBe("A single line of input.");
  });

  test("can be used as a function", () => {
    expect.hasAssertions();

    expect(
      dedent(`
      A test argument.
    `),
    ).toBe("A test argument.");
  });

  test("does not replace a backslash n when called as a function", () => {
    expect.hasAssertions();

    expect(dedent(`\\nu`)).toBe(String.raw`\nu`);
  });

  test("does not unescape hex, Unicode or code point escapes when called as a function", () => {
    expect.hasAssertions();

    expect(dedent(String.raw`\xa0\t`)).toBe(String.raw`\xa0\t`);
    expect(dedent(String.raw`\u5F1F`)).toBe(String.raw`\u5F1F`);
    expect(dedent(String.raw`\u{1F60A}`)).toBe(String.raw`\u{1F60A}`);
  });

  test("function character escapes: does not escape backticks", () => {
    expect.hasAssertions();

    expect(dedent(`\``)).toBe("`");
  });

  test("function character escapes: does not escape dollar signs", () => {
    expect.hasAssertions();

    expect(dedent(`$`)).toBe("$");
  });

  test("function character escapes: does not escape opening braces", () => {
    expect.hasAssertions();

    expect(dedent(`{`)).toBe("{");
  });

  test("function character escapes: does not escape double-escaped backticks", () => {
    expect.hasAssertions();

    expect(dedent(`\\\``)).toBe(String.raw`\``);
  });

  test("function character escapes: does not escape double-escaped dollar signs", () => {
    expect.hasAssertions();

    expect(dedent(`\\$`)).toBe(String.raw`\$`);
  });

  test("function character escapes: does not escape double-escaped opening braces", () => {
    expect.hasAssertions();

    expect(dedent(`\\{`)).toBe(String.raw`\{`);
  });

  test("function character escapes: ignores closing braces", () => {
    expect.hasAssertions();

    expect(dedent(`}`)).toBe("}");
  });

  describe.each([undefined, false, true])(
    "function character escapes: with escapeSpecialCharacters %s",
    (escapeSpecialCharacters) => {
      const isEscaping = escapeSpecialCharacters === true;
      const dedenter = dedent.withOptions({ escapeSpecialCharacters });

      test("backticks", () => {
        expect.hasAssertions();

        expect(dedenter(`\``)).toBe("`");
      });

      test("dollar signs", () => {
        expect.hasAssertions();

        expect(dedenter(`$`)).toBe("$");
      });

      test("opening braces", () => {
        expect.hasAssertions();

        expect(dedenter(`{`)).toBe("{");
      });

      test("double-escaped backticks", () => {
        expect.hasAssertions();

        expect(dedenter(`\\\``)).toBe(isEscaping ? "`" : String.raw`\``);
      });

      test("double-escaped dollar signs", () => {
        expect.hasAssertions();

        expect(dedenter(`\\$`)).toBe(isEscaping ? "$" : String.raw`\$`);
      });

      test("double-escaped opening braces", () => {
        expect.hasAssertions();

        expect(dedenter(`\\{`)).toBe(isEscaping ? "{" : String.raw`\{`);
      });
    },
  );

  describe.each([undefined, false, true])("with trimWhitespace %s", (trimWhitespace) => {
    test("with trailing whitespace", () => {
      expect.hasAssertions();

      expect(dedent.withOptions({ trimWhitespace })("\n  foo   \n  bar   \n")).toBe(
        trimWhitespace === false ? "\nfoo   \nbar   \n" : "foo   \nbar",
      );
    });

    test("with leading whitespace", () => {
      expect.hasAssertions();

      expect(dedent.withOptions({ trimWhitespace })("\n\n\n  foo\n")).toBe(
        trimWhitespace === false ? "\n\n\nfoo\n" : "foo",
      );
    });
  });

  test("string tag character escapes: escapes backticks", () => {
    expect.hasAssertions();

    expect(dedent`\``).toBe("`");
  });

  test("string tag character escapes: escapes dollar signs", () => {
    expect.hasAssertions();

    expect(dedent`\$`).toBe("$");
  });

  test("string tag character escapes: escapes opening braces", () => {
    expect.hasAssertions();

    expect(dedent`\{`).toBe("{");
  });

  test("string tag character escapes: ignores closing braces", () => {
    expect.hasAssertions();

    expect(dedent`\}`).toBe(String.raw`\}`);
  });

  describe.each([undefined, false, true])(
    "string tag character escapes: with escapeSpecialCharacters %s",
    (escapeSpecialCharacters) => {
      test("backticks", () => {
        expect.hasAssertions();

        expect(dedent.withOptions({ escapeSpecialCharacters })`\``).toBe(
          escapeSpecialCharacters === false ? String.raw`\`` : "`",
        );
      });

      test("dollar signs", () => {
        expect.hasAssertions();

        expect(dedent.withOptions({ escapeSpecialCharacters })`\$`).toBe(
          escapeSpecialCharacters === false ? String.raw`\$` : "$",
        );
      });

      test("opening braces", () => {
        expect.hasAssertions();

        expect(dedent.withOptions({ escapeSpecialCharacters })`\{`).toBe(
          escapeSpecialCharacters === false ? String.raw`\{` : "{",
        );
      });
    },
  );

  test("doesn't strip explicit newlines", () => {
    expect.hasAssertions();

    expect(dedent`
      <p>Hello world!</p>\n
    `).toBe("<p>Hello world!</p>\n");
  });

  test("doesn't strip explicit newlines with mindent", () => {
    expect.hasAssertions();

    expect(dedent`
      <p>
        Hello world!
      </p>\n
    `).toBe("<p>\n  Hello world!\n</p>\n");
  });

  test("escape sequences: passes through a hex escape", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line unicorn/no-hex-escape, unicorn/escape-case -- the hex escape is the syntax under test
    expect(dedent`\xa0\t`).toBe(" \t");
  });

  test("escape sequences: passes through a fixed-length Unicode escape", () => {
    expect.hasAssertions();

    expect(dedent`\u5F1F`).toBe("\u5F1F");
  });

  test("escape sequences: passes through a Unicode code point escape", () => {
    expect.hasAssertions();

    expect(dedent`\u{1F60A}`).toBe("\u{1F60A}");
  });

  test("escape sequences: keeps an out-of-range code point escape as typed instead of throwing", () => {
    expect.hasAssertions();

    expect(dedent`\u{110000}`).toBe(String.raw`\u{110000}`);
  });

  const dedenter = dedent.withOptions({ escapeSpecialCharacters: false });

  test("escape sequences when escapeSpecialCharacters is false: keeps a hex escape", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line unicorn/no-hex-escape, unicorn/escape-case -- the hex escape is the syntax under test
    expect(dedenter`\xa0\t`).toBe(String.raw`\xa0\t`);
  });

  test("escape sequences when escapeSpecialCharacters is false: keeps a fixed-length Unicode escape", () => {
    expect.hasAssertions();

    expect(dedenter`\u5F1F`).toBe(String.raw`\u5F1F`);
  });

  test("escape sequences when escapeSpecialCharacters is false: keeps a Unicode code point escape", () => {
    expect.hasAssertions();

    expect(dedenter`\u{1F60A}`).toBe(String.raw`\u{1F60A}`);
  });

  test("escapes in interpolated values: should escape when called with template strings (hex escape)", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line unicorn/no-hex-escape, unicorn/escape-case -- the hex escape is the syntax under test
    expect(dedent`a\xa0b`).toBe("a b");
  });

  test("escapes in interpolated values: should escape when called with template strings (escaped interpolation)", () => {
    expect.hasAssertions();

    expect(dedent`\${hi}`).toBe(`\${hi}`);
  });

  test("escapes in interpolated values: should escape when called with template strings (multiline)", () => {
    expect.hasAssertions();

    expect(dedent`
      \${hi}
      name
    `).toBe(`\${hi}\nname`);
  });

  // Regressions: the escape pass ran over the whole result, so a backslash sequence inside a value was unescaped too
  test("escapes in interpolated values: #109 #110 #112 keeps a backslash sequence in an interpolated value as typed", () => {
    expect.hasAssertions();

    expect(dedent`x: ${String.raw`a\tb`}`).toBe(String.raw`x: a\tb`);
  });

  test("escapes in interpolated values: #113 keeps a Windows-style path in an interpolated value as typed", () => {
    expect.hasAssertions();

    expect(dedent`path: ${String.raw`C:\new\table`}`).toBe(String.raw`path: C:\new\table`);
  });

  test("escapes in interpolated values: #95 keeps an escaped backslash from escaping the escape after it", () => {
    expect.hasAssertions();

    expect(dedent`\\\$`).toBe(String.raw`\$`);
  });

  test("escapes in interpolated values: #34 #90 keeps an escaped backslash before an n as a backslash and an n", () => {
    expect.hasAssertions();

    expect(dedent`\\n`).toBe(String.raw`\n`);
  });

  test("#94 turns a carriage return escape into a carriage return", () => {
    expect.hasAssertions();

    expect(dedent`line one\r
      line two`).toBe("line one\r\nline two");
  });

  test("#81 removes only the indentation every line shares", () => {
    expect.hasAssertions();

    expect(dedent(" first line\n   second line")).toBe("first line\n  second line");
  });

  test("#22 keeps a line continuation's join when the next line has an interpolation", () => {
    expect.hasAssertions();

    expect(dedent`${"one "}\
      two
      three`).toBe("one two\nthree");
  });

  test("#101 #104 keeps non-ASCII characters", () => {
    expect.hasAssertions();

    expect(dedent`😊`).toBe("😊");
    expect(dedent`弟気`).toBe("弟気");
  });

  describe.each([undefined, false, true])("with alignValues %s", (alignValues) => {
    test("with nested text", () => {
      expect.hasAssertions();

      expect(
        dedent.withOptions({ alignValues })`
          Some nested items I want to dedent:
            * first
            ${dedent`
              * second
              * third`}
            * fourth
            ${dedent`
              * fifth
              * sixth`}
          That's all!
        `,
      ).toBe(
        alignValues === true
          ? "Some nested items I want to dedent:\n  * first\n  * second\n  * third\n  * fourth\n  * fifth\n  * sixth\nThat's all!"
          : "Some nested items I want to dedent:\n  * first\n  * second\n* third\n  * fourth\n  * fifth\n* sixth\nThat's all!",
      );
    });
  });

  test("#78 #12 keeps a multi-line JSON value's indentation when aligned", () => {
    expect.hasAssertions();

    expect(
      dedent.withOptions({ alignValues: true })`
        Foo
        ${JSON.stringify({ a: "b" }, null, 2)}
        Bar
      `,
    ).toBe('Foo\n{\n  "a": "b"\n}\nBar');
  });

  test("withOptions keeps the options it was given when extended", () => {
    expect.hasAssertions();

    expect(dedent.withOptions({ alignValues: true }).withOptions({ trimWhitespace: false })("\n  foo\n")).toBe(
      "\nfoo\n",
    );
  });
});
