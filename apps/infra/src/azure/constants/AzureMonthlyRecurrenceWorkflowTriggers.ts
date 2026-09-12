const recurrence = {
  frequency: "Month",
  interval: 1,
  startTime: "2025-01-01T00:00:00Z",
  timeZone: "UTC",
};

// The first-of-the-month trigger every guard's restore workflow runs on, so a budget cycle's teardown is undone
// When the next cycle's budget resets
const AzureMonthlyRecurrenceWorkflowTriggers: Record<string, unknown> = {
  Recurrence: {
    evaluatedRecurrence: recurrence,
    recurrence,
    type: "Recurrence",
  },
};

export default AzureMonthlyRecurrenceWorkflowTriggers;
