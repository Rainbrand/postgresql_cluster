import { generatePath, resolvePath } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns/format';
import { isValid } from 'date-fns/isValid';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
declare const window: any;

/**
 * Function generates absolute path that can be used for react-router "navigate" function.
 * @param path - Absolute URN path.
 * @param params - Additional params that will be substituted in URN dynamic values.
 */
export const generateAbsoluteRouterPath = (path: string, params?: Record<string, unknown>) =>
  resolvePath(generatePath(path, params));

/**
 * Function returns env variable passed to container or variable from .env* files.
 * @param variableName - Name of a variable.
 */
export const getEnvVariable = (variableName: string) => window?._env_?.[variableName] ?? import.meta.env[variableName];

/**
 * Function manages error event when performing request.
 * @param e - Error event.
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const handleRequestErrorCatch = (e: any) => {
  console.error(e);
  toast.error(e);
};

/**
 * Function converts timestamp to easily readable string.
 * @param timestamp - Timestamp to be converted.
 */
export const convertTimestampToReadableTime = (timestamp?: string) =>
  timestamp && isValid(timestamp) ? format(timestamp, 'MMM dd, yyyy, HH:mm:ss') : '-';

export const manageSortingOrder = (sorting: { desc?: boolean; id?: string }) =>
  sorting?.desc ? `-${sorting?.id}` : sorting?.id;
