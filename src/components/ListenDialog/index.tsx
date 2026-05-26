import { SubmitEvent, useEffect, useReducer } from 'react';
import { PlusIcon } from '@radix-ui/react-icons';
import { Dialog, IconButton, Text, Button } from '@radix-ui/themes';
import { mockState } from '@junipero/react';
import { listen } from '@tauri-apps/api/event';

import { EMPTY_KEYMAP } from '../../services/commons';
import { KeyMap } from '../../types';
import { formatKeyId } from '../../services/utils';

export interface ListenDialogProps {
  open: boolean;
  keyIndex: number;
  onOpenChange: (open: boolean) => void;
  onSave: (e: SubmitEvent, kmap: KeyMap) => void;
};

export interface ListenDialogStates {
  keyMap: KeyMap;
  isListening: boolean;
};

const ListenDialog = ({
  open,
  keyIndex,
  onOpenChange,
  onSave,
}: ListenDialogProps) => {
  const [state, dispatch] = useReducer(mockState<ListenDialogStates>, {
    keyMap: EMPTY_KEYMAP,
    isListening: true,
  });

  useEffect(() => {
    if (!state.isListening) {
      return;
    }

    const l = listen<string>('on_key_pressed', e => {
      dispatch(s => {
        return {
          ...s,
          keyMap: {
            ...s.keyMap,
            index: Number(keyIndex),
            key: { id: formatKeyId(e.payload) },
          },
          isListening: false,
        };
      });
    });

    return () => {
      l.then(f => f());
    };
  }, [state.isListening, keyIndex]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content maxWidth="450px">
        <form onSubmit={e => onSave(e, state.keyMap)}>
          <Dialog.Title>Setup the key</Dialog.Title>
          <Text as="div" size="2" mb="1" weight="bold">
            { state.isListening ? 'Press any key' : 'Key found' }
          </Text>

          <label>
            <Text as="div" size="2" mb="1" mt="3" weight="bold">
              Select a sound
            </Text>

            <IconButton radius="full" type="button">
              <PlusIcon />
            </IconButton>
          </label>

          <div className="flex gap-3 mt-2 justify-end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>

            <Button type="submit">Save</Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ListenDialog;
