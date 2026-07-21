const LogAnalyticsOverQuotaQuery =
  '_LogOperation | where Operation == "Data collection Status" | where Detail contains "OverQuota"';

export default LogAnalyticsOverQuotaQuery;
