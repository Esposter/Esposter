import ApplicationTagName from "#src/azure/constants/ApplicationTagName";
import ApplicationTagValue from "#src/azure/constants/ApplicationTagValue";

const ApplicationTags: Record<typeof ApplicationTagName, typeof ApplicationTagValue> = {
  Application: ApplicationTagValue,
};

export default ApplicationTags;
