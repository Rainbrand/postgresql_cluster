import { FC, useEffect, useState } from 'react';
import ClusterForm from '@widgets/cluster-form';
import ClusterSummary from '@widgets/cluster-summary';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ClusterFormSchema } from '@widgets/cluster-form/model/validation.ts';
import {
  CLUSTER_CREATION_TYPES,
  CLUSTER_FORM_DEFAULT_VALUES,
  CLUSTER_FORM_FIELD_NAMES,
} from '@widgets/cluster-form/model/constants.ts';
import { useTranslation } from 'react-i18next';
import { ResponseDeploymentInfo, useGetExternalDeploymentsQuery } from '@shared/api/api/deployments.ts';
import { useGetEnvironmentsQuery } from '@shared/api/api/environments.ts';
import { useGetPostgresVersionsQuery } from '@shared/api/api/other.ts';
import { useGetClustersDefaultNameQuery } from '@shared/api/api/clusters.ts';
import Spinner from '@shared/ui/spinner';
import { STORAGE_BLOCK_FIELDS } from '@entities/cluster/storage-block/model/const.ts';
import { IS_EXPERT_MODE, IS_YAML_ENABLED } from '@shared/model/constants.ts';
import YamlEditorForm from '@widgets/yaml-editor-form/ui';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ClusterFormValues } from '@/widgets/cluster-form/model/types';

/**
 * AddCluster is the main page component used for creating and configuring a new cluster.
 * It manages form state, data fetching for dependencies (deployments, environments, Postgres versions, etc.),
 * and handles default form value initialization based on fetched data.
 * The component supports both Standard and YAML Expert modes for cluster definition.
 *
 * Renders:
 * - Cluster form with all fields for creating a cluster
 * - Optional YAML editor for Expert mode
 * - Cluster summary sidebar with real-time preview
 * - Loading spinners and data fetching states
 *
 * @component
 * @returns {JSX.Element}
 */

const AddCluster: FC = () => {
  const { t } = useTranslation(['clusters', 'validation', 'toasts']);
  const [isResetting, setIsResetting] = useState(false);

  const methods = useForm<ClusterFormValues>({
    mode: 'all',
    resolver: yupResolver(ClusterFormSchema(t)),
    defaultValues: CLUSTER_FORM_DEFAULT_VALUES,
  });

  const deployments = useGetExternalDeploymentsQuery({ offset: 0, limit: 999_999_999 });
  const environments = useGetEnvironmentsQuery({ offset: 0, limit: 999_999_999 });
  const postgresVersions = useGetPostgresVersionsQuery();
  const clusterName = useGetClustersDefaultNameQuery();

  const watchClusterCreationType = useWatch({ name: CLUSTER_FORM_FIELD_NAMES.CREATION_TYPE, control: methods.control });

  useEffect(() => {
    if (
      deployments.data?.data?.length &&
      postgresVersions.data?.data?.length &&
      environments.data?.data?.length &&
      clusterName.data
    ) {
      setIsResetting(true);
      const resetForm = async () => {
        // sync function will result in form values setting error
        const providers = deployments.data!.data as ResponseDeploymentInfo[];
        methods.reset((values) => ({
          ...values,
          [CLUSTER_FORM_FIELD_NAMES.PROVIDER]: providers[0],
          [CLUSTER_FORM_FIELD_NAMES.REGION]: providers[0]?.cloud_regions?.[0]?.code ?? '',
          [CLUSTER_FORM_FIELD_NAMES.REGION_CONFIG]: providers[0]?.cloud_regions?.[0]?.datacenters?.[0] ?? {},
          [CLUSTER_FORM_FIELD_NAMES.INSTANCE_CONFIG]: providers[0]?.instance_types?.small?.[0] ?? {},
          [CLUSTER_FORM_FIELD_NAMES.POSTGRES_VERSION]: postgresVersions.data?.data?.at(-1)?.major_version ?? 18, // fallback to 18 if no versions are available
          [CLUSTER_FORM_FIELD_NAMES.ENVIRONMENT_ID]: environments.data?.data?.[0]?.id ?? 0, // fallback to 0 if no environments are available
          [CLUSTER_FORM_FIELD_NAMES.CLUSTER_NAME]: clusterName.data?.name ?? 'postgres-cluster',
          ...(IS_EXPERT_MODE
            ? {
                [STORAGE_BLOCK_FIELDS.VOLUME_TYPE]:
                  providers?.[0]?.volumes?.find((volume) => volume?.is_default)?.volume_type ??
                  providers?.[0]?.volumes?.[0]?.volume_type,
              }
            : {}),
        }));
      };
      void resetForm().then(() => setIsResetting(false));
    }
  }, [deployments.data, postgresVersions.data, environments.data, clusterName.data, methods]);

  const handleTabChange = (onChange: (event: unknown) => void) => (_: unknown, value: string) => onChange(value);

  const clustersForm = (
    <Stack direction="row">
      <Box width="75vw">
        <ClusterForm
          deploymentsData={deployments.data?.data ?? []}
          environmentsData={environments.data?.data ?? []}
          postgresVersionsData={postgresVersions.data?.data ?? []}
        />
      </Box>
      <ClusterSummary />
    </Stack>
  );

  const { isLoading } = methods.formState;

  if (isLoading || isResetting || deployments.isFetching || postgresVersions.isFetching || environments.isFetching) {
    return <Spinner />;
  }

  return (
    <FormProvider {...methods}>
      {IS_EXPERT_MODE && IS_YAML_ENABLED ? (
        <TabContext value={watchClusterCreationType}>
          <Controller
            name={CLUSTER_FORM_FIELD_NAMES.CREATION_TYPE}
            render={({ field: { onChange } }) => (
              <TabList onChange={handleTabChange(onChange)}>
                {Object.values(CLUSTER_CREATION_TYPES)?.map((value) => (
                  <Tab key={value} label={value} value={value} />
                ))}
              </TabList>
            )}
          />
          <Divider />
          {[
            { value: CLUSTER_CREATION_TYPES.FORM, content: clustersForm },
            { value: CLUSTER_CREATION_TYPES.YAML, content: <YamlEditorForm /> },
          ].map(({ value, content }) => (
            <TabPanel key={value} value={value}>
              {content}
            </TabPanel>
          ))}
        </TabContext>
      ) : (
        clustersForm
      )}
    </FormProvider>
  );
};

export default AddCluster;
