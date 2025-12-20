import { ClusterFormModalValues } from '@features/cluster-secret-modal/model/types.ts';
import {
  getBaseClusterExtraVars,
  getCloudProviderExtraVars,
  getLocalMachineExtraVars,
} from '@shared/lib/clusterValuesTransformFunctions.ts';
import { CLUSTER_FORM_FIELD_NAMES } from '@widgets/cluster-form/model/constants.ts';
import { PROVIDERS } from '@shared/config/constants.ts';

import * as YAML from 'yaml';
import { YAML_EDITOR_FORM_FIELD_NAMES } from '../model/const';
import { YamlEditorFormValues } from '../model/types';
/**
 * Function converts passed form values into correct YAML "key:value" format with mapped keys.
 * @param values - Filled form values.
 */
export const mapFormValuesToYamlEditor = (values: ClusterFormModalValues) => ({
  ...getBaseClusterExtraVars(values),
  ...(values[CLUSTER_FORM_FIELD_NAMES.PROVIDER]?.code !== PROVIDERS.LOCAL
    ? { ...getCloudProviderExtraVars(values) }
    : { ...getLocalMachineExtraVars(values) }),
});

/**
 * Parses the YAML string from the form values and returns the corresponding JavaScript object.
 *
 * @param yamlFormValues - The form values containing the YAML text.
 * @returns The parsed YAML as a JavaScript object, or undefined if the input is invalid or parsing fails.
 */
export const getParsedYamlEditorValues = (yamlFormValues: YamlEditorFormValues) => {
  const yamlValue = yamlFormValues[YAML_EDITOR_FORM_FIELD_NAMES.EDITOR];
  if (typeof yamlValue !== 'string') {
    return undefined;
  }
  try {
    return YAML.parse(yamlValue);
  } catch (e) {
    console.error(e);
  }
};
