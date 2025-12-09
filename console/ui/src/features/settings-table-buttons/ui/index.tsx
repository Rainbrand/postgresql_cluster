import React from 'react';
import Stack from '@mui/material/Stack';
import SettingsAddSecret from '@features/add-secret';

const SettingsTableButtons: React.FC = () => (
  <Stack direction="row" justifyContent="flex-end" gap="8px">
    <SettingsAddSecret />
  </Stack>
);

export default SettingsTableButtons;
