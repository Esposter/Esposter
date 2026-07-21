// Azure-native types this as ConditionOperator, whose values are the metric-alert forms ("gt").
// Scheduled query rules of kind LogAlert take the ARM spelling, which the API rejects otherwise.
const GreaterThanConditionOperator = "GreaterThan";

export default GreaterThanConditionOperator;
