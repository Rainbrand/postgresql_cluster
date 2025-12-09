import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/system/useTheme';
import { createClusterButtonHandler } from '@widgets/clusters-table/lib/functions.ts';
import DatabaseIcon from '@assets/databaseIcon.svg?react';

const ClustersEmptyRowsFallback: React.FC = () => {
  const { t } = useTranslation('clusters');
  const navigate = useNavigate();
  const theme = useTheme();

  // Subtle icon color (20% opacity): use transparent black in light mode, transparent white in dark mode
  const iconColor = theme.palette.mode === 'light' ? '#00000033' : '#FFFFFF33';

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh" margin="16px">
      <DatabaseIcon width="120" height="120" fill={iconColor} />
      <Stack width="30%" alignItems="flex-start" gap="24px">
        <Stack gap="8px">
          <Typography variant={'h5'} fontWeight="bold" whiteSpace="pre-line">
            {t('noPostgresClustersTitle')}
          </Typography>
          <Typography whiteSpace="pre-line">
            {t('noPostgresClustersLine1', { createCluster: t('createCluster') })}
          </Typography>
        </Stack>
        <Button variant="contained" onClick={createClusterButtonHandler(navigate)}>
          {t('createCluster')}
        </Button>
      </Stack>
    </Box>
  );
};

export default ClustersEmptyRowsFallback;
