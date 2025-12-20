import { UseFieldArrayRemove } from 'react-hook-form';
import { DCS_BLOCK_FIELD_NAMES, DCS_TYPES } from './const';
import { TFunction } from 'i18next';
import { valueOf } from '@/shared/model/types';

export interface DcsDatabaseBoxProps {
  index: number;
  remove?: UseFieldArrayRemove;
  fields: Record<string, string>[];
}
export interface getCorrectFieldsParams {
  watchIsDeployToDcsCluster: boolean;
  watchIsDeployToDbServers: boolean;
  watchDcsType: valueOf<typeof DCS_TYPES>;
  t: TFunction;
}

export interface DcsBlockFormValues {
  [DCS_BLOCK_FIELD_NAMES.TYPE]: string;
  [DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_NEW_CLUSTER]: boolean;
  [DCS_BLOCK_FIELD_NAMES.IS_DEPLOY_TO_DB_SERVERS]: boolean;
  [DCS_BLOCK_FIELD_NAMES.DCS_DATABASES]?: {
    [DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_HOSTNAME]?: string;
    [DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_IP_ADDRESS]?: string;
    [DCS_BLOCK_FIELD_NAMES.DCS_DATABASE_PORT]?: string;
  }[];
}
