import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CLUSTER_FORM_FIELD_NAMES } from '@widgets/cluster-form/model/constants.ts';

const ClusterNameDescriptionBlock: React.FC = () => {
  const { t } = useTranslation('clusters');
  const { control } = useFormContext();

  return (
    <Box>
      <Typography fontWeight="bold" marginBottom="8px">
        {t('description')}
      </Typography>
      <Controller
        control={control}
        name={CLUSTER_FORM_FIELD_NAMES.DESCRIPTION}
        render={({ field: { value, onChange } }) => (
          <TextField
            multiline
            minRows={1}
            maxRows={6}
            fullWidth
            value={value as string}
            onChange={onChange}
            placeholder={t('descriptionPlaceholder')}
          />
        )}
      />
    </Box>
  );
};

export default ClusterNameDescriptionBlock;
