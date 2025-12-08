import { ReactElement } from 'react';

export interface SliderBoxProps {
  amount: number;
  changeAmount: (amount: number) => void;
  icon?: ReactElement;
  unit?: string;
  min: number;
  max: number;
  marks?: { label: unknown; value: unknown }[];
  marksAmount?: number;
  marksAdditionalLabel?: string;
  step?: number | null;
  error?: object;
  limitMin?: boolean;
  limitMax?: boolean;
  topRightElements?: ReactElement | null;
}

export interface Mark {
  label: string | number;
  value: string | number;
}

export type GenerateMarkType = (value: number, marksAdditionalLabel: string) => Mark;

export type GenerateSliderMarksType = (
  min: number,
  max: number,
  amount: number,
  marksAdditionalLabel: string,
) => Mark[];
