import type { SxProps } from '@mui/material/styles';
import { ReactNode } from 'react';

export interface ClusterFormSelectableBoxProps {
  children?: ReactNode;
  isActive?: boolean;
  sx?: SxProps;
  [key: string]: unknown;
}
