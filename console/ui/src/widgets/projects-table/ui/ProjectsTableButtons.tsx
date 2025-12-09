import { FC } from 'react';
import AddProject from '@features/add-project';
import Stack from '@mui/material/Stack';

const ProjectsTableButtons: FC = () => {
  return (
    <Stack direction="row" justifyContent="flex-end" gap="4px">
      <AddProject />
    </Stack>
  );
};

export default ProjectsTableButtons;
