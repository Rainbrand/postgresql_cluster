import { FC, ReactNode } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { CLUSTER_FORM_FIELD_NAMES } from '@widgets/cluster-form/model/constants.ts';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import ClusterFromInstanceConfigBox from '@entities/cluster/cluster-instance-config-box';
import ErrorBox from '@shared/ui/error-box/ui';
import { ErrorBoundary } from 'react-error-boundary';
import { IS_EXPERT_MODE } from '@shared/model/constants.ts';
import CustomInstance from '@entities/cluster/instances-block/ui/CustomInstance.tsx';

const CloudFormInstancesBlock: FC = () => {
  const { t } = useTranslation('clusters');
  const { control, setValue } = useFormContext();

  const watchInstanceType = useWatch({ name: CLUSTER_FORM_FIELD_NAMES.INSTANCE_TYPE });

  const watchProvider = useWatch({ name: CLUSTER_FORM_FIELD_NAMES.PROVIDER });

  const providerInstanceTypes = watchProvider?.instance_types ?? {};

  const instances = IS_EXPERT_MODE
    ? {
        ...providerInstanceTypes,
        custom: (
          <Stack>
            <Box marginTop={1}>
              <CustomInstance />
            </Box>
          </Stack>
        ),
      }
    : providerInstanceTypes;

  const handleInstanceTypeChange = (onChange: (...event: unknown[]) => void) => (_: unknown, value: string) => {
    onChange(value);
    setValue(CLUSTER_FORM_FIELD_NAMES.INSTANCE_CONFIG, instances?.[value]?.[0]);
  };

  const handleInstanceConfigChange = (onChange: (...event: unknown[]) => void, value: string) => () => {
    onChange(value);
  };

  return (
    <Box>
      <Typography fontWeight="bold" marginBottom="8px">
        {t('selectInstanceType')}
      </Typography>
      <ErrorBoundary fallback={<ErrorBox />}>
        <TabContext value={watchInstanceType as string}>
          <Controller
            control={control}
            name={CLUSTER_FORM_FIELD_NAMES.INSTANCE_TYPE}
            render={({ field: { onChange } }) => {
              return (
                <TabList onChange={handleInstanceTypeChange(onChange)}>
                  {Object.entries(instances)?.map(([key, value]) =>
                    value ? <Tab key={key} label={key} value={key} /> : null,
                  )}
                </TabList>
              );
            }}
          />
          <Divider />
          <Controller
            control={control}
            name={CLUSTER_FORM_FIELD_NAMES.INSTANCE_CONFIG}
            render={({ field: { onChange, value } }) => {
              return (
                <>
                  {Object.entries(instances).map(([key, configs]) => (
                    <TabPanel key={key} value={key} sx={{ paddingX: 0, paddingY: '4px' }}>
                      <Stack spacing={1}>
                        {Array.isArray(configs)
                          ? configs?.map((config) => (
                              <ClusterFromInstanceConfigBox
                                key={config.code}
                                isActive={value?.code === config.code}
                                onClick={handleInstanceConfigChange(onChange, config)}
                                name={config.shared_cpu ? `${config.code} (${t('sharedVcpu')})` : config.code}
                                cpu={config.cpu}
                                ram={config.ram}
                              />
                            ))
                          : (configs as ReactNode)}
                      </Stack>
                    </TabPanel>
                  ))}
                </>
              );
            }}
          />
        </TabContext>
      </ErrorBoundary>
    </Box>
  );
};

export default CloudFormInstancesBlock;
