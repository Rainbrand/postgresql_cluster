import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { CLUSTER_FORM_FIELD_NAMES } from '@widgets/cluster-form/model/constants.ts';
import { PostgresVersionBlockProps } from '@entities/cluster/postgres-version-block/model/types.ts';

const PostgresVersionBox: FC<PostgresVersionBlockProps> = ({ postgresVersions }) => {
  const { t } = useTranslation('clusters');
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Box>
      <Typography fontWeight="bold" marginBottom="8px">
        {t('postgresVersion')}
      </Typography>
      <Controller
        control={control}
        name={CLUSTER_FORM_FIELD_NAMES.POSTGRES_VERSION}
        render={({ field: { value, onChange } }) => (
          <Select
            size="small"
            fullWidth
            value={value}
            onChange={onChange}
            error={!!errors[CLUSTER_FORM_FIELD_NAMES.POSTGRES_VERSION]}
            helperText={errors[CLUSTER_FORM_FIELD_NAMES.POSTGRES_VERSION]?.message}>
            {postgresVersions.map((version) => (
              <MenuItem key={version?.major_version} value={version?.major_version}>
                {version?.major_version}
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </Box>
  );
};

export default PostgresVersionBox;
