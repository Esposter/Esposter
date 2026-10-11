import type { SanitizeHtmlOptions } from "#src/models/sanitizeHtml/SanitizeHtmlOptions";

import { sanitizeHtml } from "#src/services/sanitizeHtml/sanitizeHtml";
import { describe, expect, test } from "vitest";

// The cases of sanitize-html's own suite (apostrophecms/sanitize-html, test/test.js) that our option surface can express:
// 43 rows. Each expectation is the upstream one with the rel and target every link now carries added, except three rows
// That differ on purpose. Line 180 (padding a character code with zeros) gives a U+FFFD in its scheme, which this policy
// Reads as a scheme that could be javascript and drops; line 774 (a double less-than) and line 1442 (a class on a span)
// Are rows whose link or class the policy keeps or drops by its own rules. Line 1698, an empty non-boolean attribute
// Removed by upstream, is left out: this policy keeps an empty value as written.
describe(sanitizeHtml, () => {
  const cases: [string, string, SanitizeHtmlOptions | undefined, string][] = [
    [
      "should pass through simple, well-formed markup",
      "<div><p>Hello <b>there</b></p></div>",
      undefined,
      "<div><p>Hello <b>there</b></p></div>",
    ],
    ["should respect text nodes at top level", "Blah blah blah<p>Whee!</p>", undefined, "Blah blah blah<p>Whee!</p>"],
    ["should return an empty string when input is an empty string", "", undefined, ""],
    [
      "should reject markup not allowlisted without destroying its text",
      "<div><wiggly>Hello</wiggly></div>",
      undefined,
      "<div>Hello</div>",
    ],
    [
      "should accept a custom list of allowed tags",
      "<blue><red><green>Cheese</green></red></blue>",
      { allowedTags: ["blue", "green"] },
      "<blue><green>Cheese</green></blue>",
    ],
    [
      "should reject attributes not allowlisted",
      '<a href="foo.html" whizbang="whangle">foo</a>',
      undefined,
      '<a href="foo.html" rel="noopener noreferrer nofollow" target="_blank">foo</a>',
    ],
    [
      "should accept a custom list of allowed attributes per element",
      '<a href="foo.html" whizbang="whangle">foo</a>',
      { allowedAttributes: { a: ["href", "whizbang"] } },
      '<a href="foo.html" whizbang="whangle" rel="noopener noreferrer nofollow" target="_blank">foo</a>',
    ],
    [
      "should reject hrefs that are not relative, ftp, http, https or mailto",
      '<a href="http://google.com">google</a><a href="https://google.com">https google</a><a href="ftp://example.com">ftp</a><a href="mailto:test@test.com">mailto</a><a href="/relative.html">relative</a><a href="javascript:alert(0)">javascript</a>',
      undefined,
      '<a href="http://google.com" rel="noopener noreferrer nofollow" target="_blank">google</a><a href="https://google.com" rel="noopener noreferrer nofollow" target="_blank">https google</a><a href="ftp://example.com" rel="noopener noreferrer nofollow" target="_blank">ftp</a><a href="mailto:test@test.com" rel="noopener noreferrer nofollow" target="_blank">mailto</a><a href="/relative.html" rel="noopener noreferrer nofollow" target="_blank">relative</a><a rel="noopener noreferrer nofollow" target="_blank">javascript</a>',
    ],
    [
      "should cope identically with capitalized attributes and tags and should tolerate capitalized schemes",
      '<A HREF="http://google.com">google</a><a href="HTTPS://google.com">https google</a><a href="ftp://example.com">ftp</a><a href="mailto:test@test.com">mailto</a><a href="/relative.html">relative</a><a href="javascript:alert(0)">javascript</a>',
      undefined,
      '<a href="http://google.com" rel="noopener noreferrer nofollow" target="_blank">google</a><a href="HTTPS://google.com" rel="noopener noreferrer nofollow" target="_blank">https google</a><a href="ftp://example.com" rel="noopener noreferrer nofollow" target="_blank">ftp</a><a href="mailto:test@test.com" rel="noopener noreferrer nofollow" target="_blank">mailto</a><a href="/relative.html" rel="noopener noreferrer nofollow" target="_blank">relative</a><a rel="noopener noreferrer nofollow" target="_blank">javascript</a>',
    ],
    [
      "should drop the content of script elements",
      '<script>alert("ruhroh!");</script><p>Paragraph</p>',
      undefined,
      "<p>Paragraph</p>",
    ],
    [
      "should drop the content of style elements",
      "<style>.foo { color: blue; }</style><p>Paragraph</p>",
      undefined,
      "<p>Paragraph</p>",
    ],
    [
      "should drop the content of textarea elements",
      "<textarea>Nifty</textarea><p>Paragraph</p>",
      undefined,
      "<p>Paragraph</p>",
    ],
    [
      "should drop the content of option elements",
      "<select><option>one</option><option>two</option></select><p>Paragraph</p>",
      undefined,
      "<p>Paragraph</p>",
    ],
    [
      "should drop the content of textarea elements but keep the closing parent tag, when nested",
      "<p>Paragraph<textarea>Nifty</textarea></p>",
      undefined,
      "<p>Paragraph</p>",
    ],
    [
      "should retain the content of fibble elements by default",
      "<fibble>Nifty</fibble><p>Paragraph</p>",
      undefined,
      "Nifty<p>Paragraph</p>",
    ],
    [
      "should retain allowed tags within a fibble element if fibble is not specified for nonTextTags",
      "<fibble>Ni<em>f</em>ty</fibble><p>Paragraph</p>",
      undefined,
      "Ni<em>f</em>ty<p>Paragraph</p>",
    ],
    [
      "should preserve entities as such",
      '<a name="&lt;silly&gt;">&lt;Kapow!&gt;</a>',
      undefined,
      '<a name="&lt;silly&gt;" rel="noopener noreferrer nofollow" target="_blank">&lt;Kapow!&gt;</a>',
    ],
    [
      "should tolerate not closed p tags",
      "<div><p>inner text 1<p>inner text 2<p>inner text 3</div>",
      undefined,
      "<div><p>inner text 1</p><p>inner text 2</p><p>inner text 3</p></div>",
    ],
    [
      "should escape not closed p tags, if not in allowedTags array",
      "<div><p>inner text 1<p>inner text 2<p>inner text 3</div>",
      { allowedTags: ["div"] },
      "<div>inner text 1inner text 2inner text 3</div>",
    ],
    ["should dump comments", "<p><!-- Blah blah -->Whee</p>", undefined, "<p>Whee</p>"],
    [
      "should dump a sneaky encoded javascript url",
      '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">Hax</a>',
      undefined,
      '<a rel="noopener noreferrer nofollow" target="_blank">Hax</a>',
    ],
    [
      "should dump an uppercase javascript url",
      "<a href=\"JAVASCRIPT:alert('foo')\">Hax</a>",
      undefined,
      '<a rel="noopener noreferrer nofollow" target="_blank">Hax</a>',
    ],
    [
      "should dump a javascript URL with a comment in the middle (probably only respected by browsers in XML data islands, but just in case someone enables those)",
      "<a href=\"java<!-- -->script:alert('foo')\">Hax</a>",
      undefined,
      '<a rel="noopener noreferrer nofollow" target="_blank">Hax</a>',
    ],
    [
      "should not mess up a hashcode with a : in it",
      '<a href="awesome.html#this:stuff">Hi</a>',
      undefined,
      '<a href="awesome.html#this:stuff" rel="noopener noreferrer nofollow" target="_blank">Hi</a>',
    ],
    [
      "should dump character codes 1-32 before testing scheme",
      "<a href=\"java\u0000&#14;\t\r\n script:alert('foo')\">Hax</a>",
      undefined,
      '<a rel="noopener noreferrer nofollow" target="_blank">Hax</a>',
    ],
    [
      "should dump character codes 1-32 even when escaped with padding rather than trailing ;",
      "<a href=\"java&#0000001script:alert('foo')\">Hax</a>",
      undefined,
      '<a rel="noopener noreferrer nofollow" target="_blank">Hax</a>',
    ],
    [
      "should dump character codes 1-32 even when escaped with padding rather than trailing ;",
      "<a href=\"java&#0000000script:alert('foo')\">Hax</a>",
      undefined,
      '<a rel="noopener noreferrer nofollow" target="_blank">Hax</a>',
    ],
    [
      "should still like nice schemes",
      '<a href="http://google.com/">Hi</a>',
      undefined,
      '<a href="http://google.com/" rel="noopener noreferrer nofollow" target="_blank">Hi</a>',
    ],
    [
      "should still like nice relative URLs",
      '<a href="hello.html">Hi</a>',
      undefined,
      '<a href="hello.html" rel="noopener noreferrer nofollow" target="_blank">Hi</a>',
    ],
    [
      "should allow specific classes when allowlisted with allowedClasses for a single tag",
      '<p class="nifty simple dippy">whee</p>',
      { allowedTags: ["p"], allowedClasses: { p: ["nifty"] } },
      '<p class="nifty">whee</p>',
    ],
    [
      "should not act weird when the class attribute is empty",
      '<p class="">whee</p>',
      { allowedTags: ["p"], allowedClasses: { p: ["nifty"] } },
      "<p>whee</p>",
    ],
    ["should not crash on bad markup", "<p a", undefined, ""],
    [
      "should not be faked out by double <",
      '<<img src="javascript:evil"/>img src="javascript:evil"/>',
      undefined,
      '&lt;img src="javascript:evil"/&gt;',
    ],
    [
      "should not be faked out by double <",
      '<<a href="javascript:evil"/>a href="javascript:evil"/>',
      undefined,
      '&lt;<a rel="noopener noreferrer nofollow" target="_blank">a href="javascript:evil"/&gt;</a>',
    ],
    [
      "should not crash due to tag names that are properties of the universal Object prototype",
      "!<__proto__>!",
      undefined,
      "!&lt;__proto__&gt;!",
    ],
    [
      "should allow protocol relative links by default",
      '<a href="//cnn.com/example">test</a>',
      undefined,
      '<a href="//cnn.com/example" rel="noopener noreferrer nofollow" target="_blank">test</a>',
    ],
    [
      'Should encode &, <, > and where necessary, "',
      '"< & >" <span class="&#34;test&#34;">cool</span>',
      { allowedTags: ["span"], allowedAttributes: { span: ["class"] } },
      '"&lt; &amp; &gt;" <span>cool</span>',
    ],
    [
      "should parse path-rooted relative URLs sensibly",
      '<a href="/foo"></a>',
      undefined,
      '<a href="/foo" rel="noopener noreferrer nofollow" target="_blank"></a>',
    ],
    [
      "should parse bare relative URLs sensibly",
      '<a href="foo"></a>',
      undefined,
      '<a href="foo" rel="noopener noreferrer nofollow" target="_blank"></a>',
    ],
    [
      "should parse ../ relative URLs sensibly",
      '<a href="../../foo"></a>',
      undefined,
      '<a href="../../foo" rel="noopener noreferrer nofollow" target="_blank"></a>',
    ],
    [
      "should parse protocol relative URLs sensibly",
      '<a href="//foo.com/foo"></a>',
      undefined,
      '<a href="//foo.com/foo" rel="noopener noreferrer nofollow" target="_blank"></a>',
    ],
    ["should discard unclosed disallowed tags", "<test>Hello", undefined, "Hello"],
    ["should discard unclosed tags without closing bracket in discard mode", "<hello", undefined, ""],
  ];

  test.each(cases)("%s with %j", (_title, input, options, expected) => {
    expect.hasAssertions();

    expect(sanitizeHtml(input, options)).toBe(expected);
  });
});
