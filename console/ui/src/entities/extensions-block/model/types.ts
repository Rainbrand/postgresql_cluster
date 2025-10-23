import { EXTENSION_BLOCK_FIELD_NAMES } from '@entities/extensions-block/model/const.ts';
import { ResponseDatabaseExtension } from '@shared/api/api/other.ts';
import { Dispatch, SetStateAction } from 'react';

export type EnabledExtensions = Record<string, string[]>;

export interface ExtensionBoxProps {
  extension: ResponseDatabaseExtension;
  setEnabledExtensions: Dispatch<SetStateAction<EnabledExtensions>>;
}

export interface ExtensionsBlockValues {
  [EXTENSION_BLOCK_FIELD_NAMES.EXTENSIONS]?: ResponseDatabaseExtension[];
}
