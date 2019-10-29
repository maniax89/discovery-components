import { SearchResultsProps } from '../SearchResults';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash/get';

export const getDisplaySettings = (
  params: Pick<SearchResultsProps, 'resultTitleField' | 'bodyField' | 'usePassages'>,
  componentSettings: DiscoveryV1.ComponentSettingsResponse | null = null
): Required<Pick<SearchResultsProps, 'resultTitleField' | 'bodyField' | 'usePassages'>> => {
  return {
    resultTitleField:
      params.resultTitleField ||
      get(componentSettings, 'fields_shown.title.field', 'extracted_metadata.title'),
    bodyField: params.bodyField || get(componentSettings, 'fields_shown.body.field', 'text'),
    usePassages:
      params.usePassages === undefined
        ? get(componentSettings, 'fields_shown.body.use_passage', true)
        : params.usePassages
  };
};