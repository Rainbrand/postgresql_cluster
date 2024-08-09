import { FC, Suspense } from 'react';
import { Box, Divider, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from '@features/bradcrumbs';
import Spinner from '@shared/ui/spinner';

const Main: FC = () => (
  <main style={{ display: 'flex', overflow: 'auto', width: '100%', padding: '8px' }}>
    <Box width="100%">
      <Toolbar />
      <Box>
        <Breadcrumbs />
        <Divider />
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </Box>
    </Box>
  </main>
);

export default Main;