// The ids a survey field's description and error are drawn under, and the describedBy a control names them by, so a
// Reader of speech hears both with the control. A description or an error that is not drawn is named by neither
export const useSurveyDescribedBy = (
  description: MaybeRefOrGetter<string | undefined>,
  error: MaybeRefOrGetter<string>,
) => {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = computed(
    () => [toValue(description) && descriptionId, toValue(error) && errorId].filter(Boolean).join(" ") || undefined,
  );
  return { describedBy, descriptionId, errorId };
};
