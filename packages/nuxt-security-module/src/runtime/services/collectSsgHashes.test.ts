import { CSP_HASH_ALGORITHM } from "#src/runtime/constants";
import { collectSsgHashes } from "#src/runtime/services/collectSsgHashes";
import { generateHash } from "#src/runtime/services/generateHash";
import { describe, expect, test } from "vitest";

describe(collectSsgHashes, () => {
  const OPTIONS = { hashScripts: true, hashStyles: true, meta: true };

  test("an inline script is hashed by its body", async () => {
    expect.hasAssertions();

    const hash = await generateHash("x", CSP_HASH_ALGORITHM);
    await expect(collectSsgHashes("<script>x</script>", OPTIONS)).resolves.toStrictEqual({
      script: [`'${hash}'`],
      style: [],
    });
  });

  test("a script with a src contributes its integrity attribute, and one without an integrity is not hashed", async () => {
    expect.hasAssertions();

    await expect(
      collectSsgHashes('<script src="/a.js" integrity="sha384-A"></script><script src="/b.js"></script>', OPTIONS),
    ).resolves.toStrictEqual({ script: ["'sha384-A'"], style: [] });
  });

  test("a stylesheet link contributes its integrity to the style directive", async () => {
    expect.hasAssertions();

    await expect(
      collectSsgHashes('<link rel="stylesheet" href="/s.css" integrity="sha384-S">', OPTIONS),
    ).resolves.toStrictEqual({ script: [], style: ["'sha384-S'"] });
  });

  test("an icon link contributes no hash, since it loads neither a script nor a stylesheet", async () => {
    expect.hasAssertions();

    await expect(
      collectSsgHashes('<link rel="icon" href="/f.ico" integrity="sha384-I">', OPTIONS),
    ).resolves.toStrictEqual({ script: [], style: [] });
  });
});
