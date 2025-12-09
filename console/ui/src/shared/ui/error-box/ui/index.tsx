import { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { ErrorBoxProps } from '@shared/ui/error-box/model/types.ts';

const ErrorBox: FC<ErrorBoxProps> = ({ text }) => {
  const { t } = useTranslation('shared');

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Typography fontWeight="bold">{text ?? t('somethingWentWrongWhileRendering')}</Typography>
    </Box>
  );
};

export default ErrorBox;
