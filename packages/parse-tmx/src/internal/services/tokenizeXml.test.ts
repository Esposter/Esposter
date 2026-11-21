import { tokenizeXml } from "#src/internal/services/tokenizeXml";
import { describe, expect, test } from "vitest";

type XmlEvent = ["close", string] | ["open", string, Record<string, string>] | ["text", string];

const readEvents = (xml: string): XmlEvent[] => {
  const events: XmlEvent[] = [];
  tokenizeXml(xml, {
    onCloseTag: (name) => {
      events.push(["close", name]);
    },
    onOpenTag: (name, attributes) => {
      events.push(["open", name, attributes]);
    },
    onText: (text) => {
      events.push(["text", text]);
    },
  });
  return events;
};

describe(tokenizeXml, () => {
  test("reads elements, attributes and text in document order", () => {
    expect.hasAssertions();

    expect(readEvents(`<map version="1.10"><layer id='1'>a</layer><object/></map>`)).toStrictEqual([
      ["open", "map", { version: "1.10" }],
      ["open", "layer", { id: "1" }],
      ["text", "a"],
      ["close", "layer"],
      ["open", "object", {}],
      ["close", "object"],
      ["close", "map"],
    ]);
  });

  test("reads a CDATA section as text, its markup unread", () => {
    expect.hasAssertions();

    expect(readEvents("<a><![CDATA[<b>&amp;]]></a>")).toStrictEqual([
      ["open", "a", {}],
      ["text", "<b>&amp;"],
      ["close", "a"],
    ]);
  });

  test("ignores a leading byte order mark", () => {
    expect.hasAssertions();

    expect(readEvents("\uFEFF<a/>")).toStrictEqual([
      ["open", "a", {}],
      ["close", "a"],
    ]);
  });

  test.each<[string, string, XmlEvent[]]>([
    [
      "sax#10 sax#73 reads a name in any script XML allows",
      "<книга>текст</книга>",
      [
        ["open", "книга", {}],
        ["text", "текст"],
        ["close", "книга"],
      ],
    ],
    [
      "sax#97 decodes an astral character reference",
      "<a>&#x1F525;</a>",
      [
        ["open", "a", {}],
        ["text", "🔥"],
        ["close", "a"],
      ],
    ],
    [
      "sax#250 reads an attribute on the root",
      `<x a="A"></x>`,
      [
        ["open", "x", { a: "A" }],
        ["close", "x"],
      ],
    ],
    [
      "sax#266 decodes the predefined entities in a document with a DOCTYPE",
      `<!DOCTYPE a [<!ENTITY e "x">]><a b="&lt;&amp;">&gt;&quot;&apos;&#34;</a>`,
      [
        ["open", "a", { b: "<&" }],
        ["text", `>"'"`],
        ["close", "a"],
      ],
    ],
    [
      "sax#233 ends a processing instruction at its first ?>",
      "<?Is this legal XML??><a/>",
      [
        ["open", "a", {}],
        ["close", "a"],
      ],
    ],
    [
      "sax#304 normalises line endings, and an attribute's literal whitespace to spaces while a referenced one stays",
      `<a b="1\r\n2\t3&#10;">x\ry\r\nz</a>`,
      [
        ["open", "a", { b: "1 2 3\n" }],
        ["text", "x\ny\nz"],
        ["close", "a"],
      ],
    ],
    [
      "sax#307 reads past a DOCTYPE whose internal subset holds a processing instruction",
      `<?xml version="1.0"?>\n<!DOCTYPE r [<!ENTITY e "]>"><?pi x?>]>\n<r><!--c--><?pi data?>hello</r>\n`,
      [
        ["open", "r", {}],
        ["text", "hello"],
        ["close", "r"],
      ],
    ],
    [
      "reads past a DOCTYPE whose internal subset holds a quote inside a comment or a processing instruction",
      "<!DOCTYPE r [<!-- it's --><?pi it's?>]><r/>",
      [
        ["open", "r", {}],
        ["close", "r"],
      ],
    ],
  ])("%s", (_title, xml, events) => {
    expect.hasAssertions();

    expect(readEvents(xml)).toStrictEqual(events);
  });

  test("sax#302 keeps attributes named __proto__ and hasOwnProperty as attributes", () => {
    expect.hasAssertions();

    const [openEvent] = readEvents(`<a __proto__="b" hasOwnProperty="c"/>`) as [
      ["open", string, Record<string, string>],
    ];
    const attributes = openEvent[2];

    expect(Object.getPrototypeOf(attributes)).toBe(Object.prototype);
    expect(Object.entries(attributes)).toStrictEqual([
      ["__proto__", "b"],
      ["hasOwnProperty", "c"],
    ]);
  });

  test("sax#164 refuses an empty document", () => {
    expect.hasAssertions();

    expect(() => readEvents("")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has no root element at line 1, column 1]`,
    );
  });

  test("sax#125 refuses a document with no root element", () => {
    expect.hasAssertions();

    expect(() => readEvents("<!-- a -->")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has no root element at line 1, column 11]`,
    );
  });

  test("sax#86 sax#168 sax#182 sax#246 refuses a second root element", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a></a>\n<b/>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a second root element at line 2, column 1]`,
    );
  });

  test("sax#76 sax#166 sax#295 refuses a repeated attribute", () => {
    expect.hasAssertions();

    expect(() => readEvents('<a b="1" b="2"/>')).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, repeats the attribute b at line 1, column 10]`,
    );
  });

  test("sax#178 refuses an XML declaration after the document's start", () => {
    expect.hasAssertions();

    expect(() => readEvents('<a><?xml version="1.0"?></a>')).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has an XML declaration that is not the document's start at line 1, column 4]`,
    );
  });

  test("sax#232 refuses a processing instruction with no target", () => {
    expect.hasAssertions();

    expect(() => readEvents("<??><a/>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, expects a name at line 1, column 3]`,
    );
  });

  test("sax#298 refuses a CDATA section outside the root element", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a/><![CDATA[x]]>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a CDATA section outside the root element at line 1, column 5]`,
    );
  });

  test("sax#116 refuses a character reference with no digits", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>&#x;</a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a reference XML does not define: &#x at line 1, column 4]`,
    );
  });

  test("sax#287 refuses a reference to a character XML does not allow", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>&#x1;</a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a reference XML does not define: &#x1 at line 1, column 4]`,
    );
  });

  test("sax#153 sax#184 refuses a close tag that does not match the open element, naming both", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a></b></a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, closes <a> with </b> at line 1, column 4]`,
    );
  });

  test("sax#303 refuses a declaration outside a DOCTYPE", () => {
    expect.hasAssertions();

    expect(() => readEvents('<!ENTITY "x"><a/>')).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, expects a name at line 1, column 2]`,
    );
  });

  test("sax#215 refuses an element left open at the end", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, leaves <a> unclosed at line 1, column 4]`,
    );
  });

  test("refuses a tag with no end", () => {
    expect.hasAssertions();

    expect(() => readEvents("<map")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, leaves the tag <map> with no end at line 1, column 1]`,
    );
  });

  test("refuses text outside the root", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a/>b")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has text outside the root element at line 1, column 5]`,
    );
  });

  test("refuses an unquoted attribute", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a b=1/>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, expects a quoted value for the attribute b at line 1, column 6]`,
    );
  });

  test("refuses attributes with no whitespace between", () => {
    expect.hasAssertions();

    expect(() => readEvents('<a b="1"c="2"/>')).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, expects whitespace before an attribute of <a> at line 1, column 9]`,
    );
  });

  test("refuses < in an attribute", () => {
    expect.hasAssertions();

    expect(() => readEvents('<a b="<"/>')).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has < in the attribute b at line 1, column 7]`,
    );
  });

  test("refuses an undefined entity", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>&nbsp;</a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a reference XML does not define: &nbsp at line 1, column 4]`,
    );
  });

  test("refuses an inherited Object key as an entity", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>&constructor;</a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a reference XML does not define: &constructor at line 1, column 4]`,
    );
  });

  test("refuses __proto__ as an entity in an attribute", () => {
    expect.hasAssertions();

    expect(() => readEvents('<a b="&__proto__;"/>')).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a reference XML does not define: &__proto__ at line 1, column 7]`,
    );
  });

  test("refuses an ampersand with no reference", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>&</a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a reference XML does not define: & at line 1, column 4]`,
    );
  });

  test("refuses ]]> in character data", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>]]></a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has ]]> in its character data at line 1, column 4]`,
    );
  });

  test("refuses -- inside a comment", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a><!-- a -- b --></a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has -- inside a comment at line 1, column 11]`,
    );
  });

  test("refuses a DOCTYPE whose internal subset leaves a comment open", () => {
    expect.hasAssertions();

    expect(() => readEvents("<!DOCTYPE r [<!-- a")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a DOCTYPE with no end at line 1, column 1]`,
    );
  });

  test("refuses an unterminated comment", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a><!-- a")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a comment with no end at line 1, column 4]`,
    );
  });

  test("refuses an unterminated CDATA section", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a><![CDATA[a")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a CDATA section with no end at line 1, column 4]`,
    );
  });

  test("refuses a character XML does not allow", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>\u0001</a>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has a character XML does not allow at line 1, column 4]`,
    );
  });

  test("refuses a name that does not start as a name", () => {
    expect.hasAssertions();

    expect(() => readEvents("<1a/>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, expects a name at line 1, column 2]`,
    );
  });

  test("refuses an XML declaration after whitespace", () => {
    expect.hasAssertions();

    expect(() => readEvents(' <?xml version="1.0"?><a/>')).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, has an XML declaration that is not the document's start at line 1, column 2]`,
    );
  });

  test("refuses at the line and column an error on a later line stands at", () => {
    expect.hasAssertions();

    expect(() => readEvents("<a>\n\n  </b>")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: tokenizeXml, closes <a> with </b> at line 3, column 3]`,
    );
  });
});
