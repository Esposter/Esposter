import { sanitizeHtml } from "#src/services/sanitizeHtml/sanitizeHtml";
import { sanitizeTextHtml } from "#src/services/sanitizeHtml/sanitizeTextHtml";
import { describe, expect, test } from "vitest";

// Each case names the upstream issue or advisory it pins. The advisory's GHSA id is in its title where one exists
describe(sanitizeHtml, () => {
  test("ghsa-jxwj-j7wr-gfrw: a solidus after a raw-text end tag does not let markup through", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<textarea></textarea/><img src=x onerror=alert(1)>`, { allowedTags: ["textarea"] })).toBe("");
  });

  test("ghsa-g8qq-57p8-ggw5: an SVG animation of a link's href is dropped with its foreign elements", () => {
    expect.hasAssertions();

    expect(
      sanitizeHtml(`<svg><a><animate attributeName="href" values="#safe;javascript:alert(1)"></animate></a></svg>`),
    ).toBe("");
  });

  test("ghsa-vccv-cmxp-4j9h: a javascript: address is dropped from every URL attribute a caller allows", () => {
    expect.hasAssertions();

    expect(
      sanitizeHtml(`<button formaction="javascript:alert(1)">b</button>`, {
        allowedAttributes: { button: ["formaction"] },
        allowedTags: ["button"],
      }),
    ).toBe("<button>b</button>");
    expect(
      sanitizeHtml(`<q cite="javascript:alert(1)">q</q>`, { allowedAttributes: { q: ["cite"] }, allowedTags: ["q"] }),
    ).toBe("<q>q</q>");
  });

  test("ghsa-rpr9-rxv7-x643: an xmp element's raw text is dropped, not passed through as markup", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<xmp><img src=x onerror=alert(1)></xmp>`)).toBe("");
  });

  test("ghsa-9mrh-v2v3-xpfm: entity-encoded markup inside a textarea or option is text, never markup", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<textarea>&lt;img src=x onerror=alert(1)&gt;</textarea>`, { allowedTags: ["textarea"] })).toBe(
      "",
    );
    expect(sanitizeHtml(`<option>&lt;img src=x onerror=alert(1)&gt;</option>`, { allowedTags: ["option"] })).toBe("");
  });

  test("ghsa-xc6g-ggrc-qq4r: allowing a non-text tag does not reopen its content to the output", () => {
    expect.hasAssertions();

    expect(
      sanitizeHtml("!<textarea>&lt;/textarea&gt;<svg/onload=prompt`xs`&gt;</textarea>!", { allowedTags: ["textarea"] }),
    ).toBe("!!");
  });

  test("ghsa-3j7m-hmh3-9jmp: a tag inside a tag is not sanitised recursively, so its text is escaped", () => {
    expect.hasAssertions();

    expect(sanitizeHtml("<scr<script>ipt>alert(1)</script>")).toBe("ipt&gt;alert(1)");
  });

  test("ghsa-wg96-3933-j2w5: an unquoted attribute with an event handler on a disallowed tag is dropped with the tag", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<IMG SRC= onmouseover="alert('XSS');">`)).toBe("");
  });

  test("cve-2016-1000237 and ghsa-qhxp-v273-g94h: a script tag split by a stray less-than is never rendered", () => {
    expect.hasAssertions();

    expect(sanitizeHtml("<<script>script>alert(1)<</script>/script>")).toBe("&lt;/script&gt;");
  });

  test("ghsa-qhxp-v273-g94h: a transform's attribute value is written escaped, never as markup", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<a href="https://a&quot;&gt;&lt;img src=x onerror=alert(1)">x</a>`)).toBe(
      `<a href="https://a&quot;&gt;&lt;img src=x onerror=alert(1)" rel="noopener noreferrer nofollow" target="_blank">x</a>`,
    );
  });

  test("cve-2024-21501: a style declaration naming a URL or a file is dropped", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="background-color:url(/etc/passwd)"></span>`)).toBe("<span></span>");
  });

  test("cve-2022-25887: an HTML comment run completes without a global-replace backtrack", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<!--`.repeat(10000))).toBe("");
  });

  test("cve-2022-25887: a long run of spaces inside a style value is read in one pass", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="color:red${" ".repeat(20000)}x"></span>`)).toBe("<span></span>");
  });

  test("a document nested past the render depth is cut at it, not thrown on", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`${"<div>".repeat(300)}x`)).toBe(`${"<div>".repeat(257)}${"</div>".repeat(257)}`);
  });

  test("#77: a paragraph left open at the end of a nested textarea is closed in the output", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<p>Paragraph`)).toBe("<p>Paragraph</p>");
  });

  test("#86: a grave-accent javascript: address is dropped", () => {
    expect.hasAssertions();

    expect(sanitizeHtml('<a href="`javascript:alert(&quot;x&quot;)">x</a>')).toBe(
      `<a rel="noopener noreferrer nofollow" target="_blank">x</a>`,
    );
  });

  test("#201: a javascript: address on an allowed cite attribute is dropped", () => {
    expect.hasAssertions();

    expect(
      sanitizeHtml(`<blockquote cite="javascript:alert(1)">q</blockquote>`, {
        allowedAttributes: { blockquote: ["cite"] },
      }),
    ).toBe("<blockquote>q</blockquote>");
  });

  test("#217: an iframe's srcdoc markup is never rendered, since the iframe is not a text element", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<iframe srcdoc="<img src=x onerror=alert(1)>"></iframe>`)).toBe("");
  });

  test("#253 and #673: a class the policy does not name is dropped whatever its tag's other classes are", () => {
    expect.hasAssertions();

    expect(
      sanitizeHtml(`<span class="hljs-keyword not-allowed"></span>`, {
        allowedAttributes: { span: ["class"] },
        allowedClasses: { span: ["hljs*"] },
        allowedTags: ["span"],
      }),
    ).toBe(`<span class="hljs-keyword"></span>`);
  });

  test("#256: a class a transform writes is filtered like any other class", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<pre class="language-ts"><code class="language-ts fixed"></code></pre>`)).toBe(
      `<pre class="language-ts"><code class="language-ts"></code></pre>`,
    );
  });

  test("#305: a leading no-break space before a javascript: address does not hide its scheme", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<a href="${String.fromCodePoint(0xa0)}javascript:alert(1)">x</a>`)).toBe(
      `<a rel="noopener noreferrer nofollow" target="_blank">x</a>`,
    );
  });

  test("#325: a duplicate and a valueless attribute sanitise without throwing", () => {
    expect.hasAssertions();

    expect(() => sanitizeHtml(`<a href="leak" href=>x</a><a href>y</a>`)).not.toThrow();
  });

  test("#367, #368 and #388: a srcset URL keeps the commas a CDN puts inside it", () => {
    expect.hasAssertions();

    expect(
      sanitizeHtml(`<img srcset="https://cdn.test/f_auto,q_auto:eco,c_fit/a.jpg 1x, https://cdn.test/b.jpg 2x">`, {
        allowedAttributes: { img: ["srcset"] },
        allowedTags: ["img"],
      }),
    ).toBe(`<img srcset="https://cdn.test/f_auto,q_auto:eco,c_fit/a.jpg 1x, https://cdn.test/b.jpg 2x">`);
  });

  test("#372: a long style attribute keeps only the declarations the policy names", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="font-family:${"a ".repeat(20000)};color:red"></span>`)).toBe(
      `<span style="color:red"></span>`,
    );
  });

  test("#487 and #522: an !important on an allowed declaration survives the filter", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="color: red !important"></span>`)).toBe(
      `<span style="color:red!important"></span>`,
    );
  });

  test("#510 and #511: one allowed declaration does not drop its neighbour", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<span style="color:red;background-color:#fff"></span>`)).toBe(
      `<span style="color:red;background-color:#fff"></span>`,
    );
  });

  test("#506 and #521: text after an element a transform rewrote is kept", () => {
    expect.hasAssertions();

    expect(sanitizeTextHtml(`<input type="checkbox">after`)).toBe(`<input disabled="" type="checkbox">after`);
  });

  test("#549 and #568: a malformed opening tag leaves no stray closing tag in the output", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<div class="a"<b>text</b></div>`)).toBe("<div>text</div>");
  });

  test("#593 and #594: a numeric input sanitises to its digits", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(String(5))).toBe("5");
  });

  test("#60: text inside an option is dropped with the option, as text inside a textarea is", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<select><option>choice</option></select>`)).toBe("");
  });

  test("#633 and #634: an empty alt attribute on an allowed image is kept", () => {
    expect.hasAssertions();

    expect(
      sanitizeHtml(`<img src="https://a.test/i.png" alt="">`, {
        allowedAttributes: { img: ["src", "alt"] },
        allowedTags: ["img"],
      }),
    ).toBe(`<img src="https://a.test/i.png" alt="">`);
  });

  test("#176: an allowedTags option left undefined keeps the default list, so a script is still dropped", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<script>alert(1)</script><p>x</p>`, { allowedTags: undefined })).toBe("<p>x</p>");
  });

  test("#122, #336, #337, #393 and #422: the default allowlist keeps h1, h2, abbr and sup, and drops iframe", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<h1>a</h1><h2>b</h2><abbr>c</abbr><sup>d</sup><iframe>e</iframe>`)).toBe(
      "<h1>a</h1><h2>b</h2><abbr>c</abbr><sup>d</sup>",
    );
  });

  test("#443 and #444: tel is a default scheme for a link", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<a href="tel:+15550100">call</a>`)).toBe(
      `<a href="tel:+15550100" rel="noopener noreferrer nofollow" target="_blank">call</a>`,
    );
  });

  test("#688: the default tag list keeps menu once and main once", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<main><menu>m</menu></main>`)).toBe("<main><menu>m</menu></main>");
  });

  test("a style attribute on a tag the policy does not name is dropped", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<div style="position:fixed">x</div>`)).toBe("<div>x</div>");
  });

  test("#126, #127 and #281: an unescaped less-than is text, parsed as the HTML standard reads it", () => {
    expect.hasAssertions();

    expect(sanitizeHtml(`<p>4 <= 5</p>`)).toBe("<p>4 &lt;= 5</p>");
  });
});
