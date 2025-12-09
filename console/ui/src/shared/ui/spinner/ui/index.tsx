import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

const Spinner: FC = () => {
  return (
    <Stack alignItems="center" justifyContent="stretch" spacing={5} padding="48px">
      <CircularProgress size={48} />
    </Stack>
  );
};

export default Spinner;
