import { parseProposalTasks } from "#src/services/fleet/parseProposalTasks";
import { describe, expect, test } from "vitest";

describe(parseProposalTasks, () => {
  test("A task holds its change's phase unless it names another", () => {
    expect.hasAssertions();

    expect(
      parseProposalTasks("- [ ] 1.1 [phase 6] text\n- [ ] 1.2 text\n- [ ] 1.3 [phase 8] text\n", 4).tasks,
    ).toStrictEqual([
      { isDone: false, number: "1.1", phase: 6 },
      { isDone: false, number: "1.2", phase: 4 },
      { isDone: false, number: "1.3", phase: 4 },
    ]);
  });

  test("A change's pick phase is its lowest open task's", () => {
    expect.hasAssertions();

    expect(parseProposalTasks("- [x] 1.1 text\n- [ ] 1.2 [phase 6] text\n", 4)).toStrictEqual({
      pickPhase: 6,
      tasks: [
        { isDone: true, number: "1.1", phase: 4 },
        { isDone: false, number: "1.2", phase: 6 },
      ],
    });
  });

  test("A done task's marker is read but never sets the pick phase", () => {
    expect.hasAssertions();

    expect(parseProposalTasks("- [ ] 1.1 [phase 6] text\n- [ ] 1.2 text\n- [x] 1.3 [phase 2] text\n", 4)).toStrictEqual(
      {
        pickPhase: 4,
        tasks: [
          { isDone: false, number: "1.1", phase: 6 },
          { isDone: false, number: "1.2", phase: 4 },
          { isDone: true, number: "1.3", phase: 2 },
        ],
      },
    );
  });
});
