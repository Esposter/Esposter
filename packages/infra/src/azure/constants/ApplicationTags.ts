import ApplicationTagName from "@/azure/constants/ApplicationTagName";
import ApplicationTagValue from "@/azure/constants/ApplicationTagValue";

const ApplicationTags: Record<typeof ApplicationTagName, typeof ApplicationTagValue> = {
  Application: ApplicationTagValue,
};

export default ApplicationTags;
