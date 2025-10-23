import { ChangeEvent, FC, useEffect, useState } from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  Link,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { ExtensionBoxProps } from '@entities/extensions-block/model/types.ts';
import { useFormContext } from 'react-hook-form';
import { DATABASES_BLOCK_FIELD_NAMES } from '@entities/databases-block/model/const.ts';
import { useTranslation } from 'react-i18next';
import { intersection } from 'lodash';

const ExtensionBox: FC<ExtensionBoxProps> = ({ extension, setEnabledExtensions }) => {
  const { t } = useTranslation('clusters');
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([]);
  const [availableDatabases, setAvailableDatabases] = useState<
    {
      [DATABASES_BLOCK_FIELD_NAMES.DATABASE_NAME]: string;
    }[]
  >([]);
  const [isChecked, setIsChecked] = useState(false);

  const { watch } = useFormContext();

  const watchDatabases = watch(DATABASES_BLOCK_FIELD_NAMES.DATABASES) as {
    [DATABASES_BLOCK_FIELD_NAMES.DATABASE_NAME]: string;
  }[];

  useEffect(() => {
    setAvailableDatabases(watchDatabases.map((_, index) => index + 1)); // display indexes of databases
    setSelectedDatabases((prev) => intersection(prev, availableDatabases));
  }, [watchDatabases]);

  const handleSelectDatabase = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDatabases(e.target.value as string[]);
    if (e.target.value?.length) {
      setIsChecked(true);
      setEnabledExtensions((prev) => ({ ...prev, [extension.name]: e.target.value }));
    } else {
      setIsChecked(false);
      setEnabledExtensions((prev) => {
        const prevCopy = prev;
        delete prevCopy[extension.name];
        return prevCopy;
      });
    }
  };

  const handleSwitchClick = (e: ChangeEvent<HTMLInputElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box border="1px solid #E0E0E0" height={120} alignItems="center" p={1}>
      {extension?.image ? <img src={extension.image} width="48px" alt={'img'} /> : <Box />}
      <Stack direction="column">
        <Typography fontWeight="bold">
          {extension?.url ? (
            <Link target="_blank" href={extension.url} color="#000">
              <u>{extension.name}</u>
            </Link>
          ) : (
            extension.name
          )}
        </Typography>
        <Typography>{extension.description}</Typography>
      </Stack>
      <Box>
        <Switch checked={isChecked} onClick={handleSwitchClick} sx={{ position: 'absolute', right: 0, top: 0 }} />
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}>
          <Box bgcolor="#fff" padding={1} width={200}>
            <FormControl fullWidth>
              <InputLabel size="small">{t('databases')}</InputLabel>
              <Select
                size="small"
                fullWidth
                multiple
                renderValue={(selected) => selected.join(', ')}
                label={t('databases')}
                onChange={handleSelectDatabase}
                value={selectedDatabases}>
                {availableDatabases.map((database, index) => (
                  <MenuItem key={`database${index}`} value={database}>
                    <Checkbox checked={selectedDatabases.includes(database)} />
                    <ListItemText primary={database} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Popover>
      </Box>
    </Box>
  );
};

export default ExtensionBox;
