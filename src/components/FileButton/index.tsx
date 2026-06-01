import {
  useReducer,
  useEffect,
  SyntheticEvent,
} from 'react';
import {
  classNames,
  mockState,
} from '@junipero/react';
import { IconButton } from '@radix-ui/themes';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { open } from '@tauri-apps/plugin-dialog';

import { getFileName } from '../../services/utils';


export interface FileButtonProps{
  value?: string;
  onChange?: (value?: string) => void;
  className?: string;
  disabled?: boolean;
  text?: string;
}

export interface FileButtonState {
  value?: string;
  dirty?: boolean;
}

const FileButton = ({
  value,
  className,
  disabled = false,
  text = 'appearances.file.label',
  onChange,
  ...rest
}: FileButtonProps) => {
  const [state, dispatch] = useReducer(mockState<FileButtonState>, {
    value,
    dirty: false,
  });

  useEffect(() => {
    dispatch({ value });
  }, [value]);

  const onOpen = async () => {
    if (disabled) {
      return;
    }

    try {
      const path = await open({
        multiple: false,
        filters: [{
          name: 'Audio',
          extensions: ['mp3', 'wav', 'ogg'],
        }],
      });

      if (!path) {
        return;
      }

      dispatch({ value: path });
      onChange?.(path);
    } catch (e) {
      console.error(e);
    }
  };

  const onReset = (event: SyntheticEvent<HTMLElement>) => {
    event?.preventDefault();

    if (disabled) {
      return;
    }

    dispatch({ value: undefined });
    onChange?.(undefined);
  };

  return (
    <div
      { ...rest }
      className={classNames('flex flex-col w-full', className)}
    >
      {!state.value ? (
        <IconButton radius="full" type="button" onClick={onOpen}>
          <PlusIcon />
        </IconButton>
      ) : (
        <div className="flex gap-2">
          <div
            className={classNames(
              'overflow-hidden whitespace-nowrap text-ellipsis max-w-[60%]',
            )}
          >
            { getFileName(state.value) }
          </div>
          <div>
            <IconButton radius="full" type="button" onClick={onReset}>
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      ) }
    </div>
  );
};

export default FileButton;
