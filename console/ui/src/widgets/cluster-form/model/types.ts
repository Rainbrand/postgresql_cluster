import { ClusterFormModalValues } from '@/features/cluster-secret-modal/model/types';
import { ResponseDeploymentInfo } from '@shared/api/api/deployments.ts';
import { ResponseEnvironment } from '@shared/api/api/environments.ts';
import { ResponsePostgresVersion } from '@shared/api/api/other.ts';
import { CLUSTER_FORM_FIELD_NAMES } from './constants';

export interface ClusterFormProps {
  deploymentsData?: ResponseDeploymentInfo[];
  environmentsData?: ResponseEnvironment[];
  postgresVersionsData?: ResponsePostgresVersion[];
}

export interface ClusterFormRegionConfigBoxProps {
  name: string;
  place: string;
  isActive: boolean;
}

export interface ClusterFormValues extends ClusterFormModalValues {
  [CLUSTER_FORM_FIELD_NAMES.SECRET_ID]?: string;
}
