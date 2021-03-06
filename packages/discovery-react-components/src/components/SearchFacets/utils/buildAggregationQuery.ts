import DiscoveryV2 from 'ibm-watson/discovery/v2';

export const buildAggregationQuery = (
  configuration: DiscoveryV2.QueryTermAggregation[]
): string => {
  const aggregation = configuration.map(term => {
    return term.count
      ? 'term(' + term.field + ',count:' + term.count + ')'
      : 'term(' + term.field + ')';
  });
  return '[' + aggregation.toString() + ']';
};
