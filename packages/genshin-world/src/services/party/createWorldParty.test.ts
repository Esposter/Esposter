import { createParty } from "#src/services/party/createParty";
import { createWorldParty } from "#src/services/party/createWorldParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test, vi } from "vitest";
import { watch } from "vue";

describe(createWorldParty, () => {
  test("is heard as a member changes and not as the step's own state does", () => {
    expect.hasAssertions();

    const party = createWorldParty(createParty([1]));
    const onChange = vi.fn<() => void>();
    watch(() => [getPartyMember(party, 1).energy, party.lunarCrystallize.count, party.verdantDew.count], onChange, {
      flush: "sync",
    });
    party.lunarCrystallize.count = 1;
    party.verdantDew.count = 1;

    expect(onChange).not.toHaveBeenCalled();

    getPartyMember(party, 1).energy = 1;

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
