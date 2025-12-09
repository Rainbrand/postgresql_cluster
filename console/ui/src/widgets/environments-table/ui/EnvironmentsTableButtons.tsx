import { FC } from 'react';
import Stack from '@mui/material/Stack';
import AddEnvironment from '@features/add-environment';

const EnvironmentsTableButtons: FC = () => {
  return (
    <Stack direction="row" justifyContent="flex-end" gap="4px">
      <AddEnvironment />
    </Stack>
  );
};

export default EnvironmentsTableButtons;
