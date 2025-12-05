import { UIMatch, useMatches } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MatchHandleContent } from '@features/bradcrumbs/types.ts';

const useBreadcrumbs = (): { label: string; path: string }[] => {
  const { t } = useTranslation();
  const matches = useMatches();

  return (
    (matches as UIMatch<unknown, MatchHandleContent>[])
      .filter((match) => Boolean(match?.handle?.breadcrumb?.label))
      .map((match) => {
        let label = '';

        if (typeof match.handle.breadcrumb.label === 'function') {
          label = match.handle.breadcrumb.label({ ...match.params });
        }
        if (typeof match.handle.breadcrumb.label === 'string') {
          label = t(match.handle.breadcrumb.label, { ns: match.handle.breadcrumb?.ns });
        }

        return {
          label,
          path: match?.handle?.breadcrumb?.path ?? match.pathname,
        };
      }) ?? []
  );
};

export default useBreadcrumbs;
