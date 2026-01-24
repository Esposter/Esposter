import { MENTION_ID_ATTRIBUTE, MENTION_TYPE, MENTION_TYPE_ATTRIBUTE } from "@/services/message/constants";
import { getMentions } from "@/services/message/getMentions";
import { describe, expect, test } from "vitest";

describe(getMentions, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(getMentions("")).toHaveLength(0);
  });

  test("mention", () => {
    expect.hasAssertions();

    const mentions = getMentions(
      `<span ${MENTION_ID_ATTRIBUTE}="id" ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}"></span>`,
    );

    expect(mentions).toHaveLength(1);
    expect(mentions[0].getAttribute(MENTION_ID_ATTRIBUTE)).toBe("id");
  });
});
