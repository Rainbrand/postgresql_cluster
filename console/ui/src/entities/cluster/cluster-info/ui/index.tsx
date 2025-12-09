import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import { ClusterInfoProps } from '@entities/cluster/cluster-info/model/types.ts';
import { useGetClusterInfoConfig } from '@entities/cluster/cluster-info/lib/hooks.tsx';
import InfoCardBody from '@shared/ui/info-card-body';

const ClusterInfo: FC<ClusterInfoProps> = ({ postgresVersion, clusterName, description, environment, location }) => {
  const { t } = useTranslation(['clusters', 'shared']);

  const config = useGetClusterInfoConfig({
    postgresVersion,
    clusterName,
    description,
    environment,
    location,
  });

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <EditNoteOutlinedIcon />
        <Typography>{t('clusterInfo')}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <InfoCardBody config={config} />
      </AccordionDetails>
    </Accordion>
  );
};

export default ClusterInfo;
