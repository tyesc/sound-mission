import { useEffect, useReducer } from 'react';
import { Dialog, Text, Button } from '@radix-ui/themes';
import { mockState } from '@junipero/react';
import { listen } from '@tauri-apps/api/event';

import { EMPTY_KEYMAP } from '../../services/commons';
import { KeyMap, MidiEvent } from '../../types';
import { formatKeyId, getFileName, padPosToId } from '../../services/utils';
import FileButton from '../FileButton';
import { PadPosition } from '../Launchpad';

export interface ListenDialogProps {
  open: boolean;
  keyMap: KeyMap[];
  currentPadPos?: PadPosition;
  onOpenChange: (open: boolean) => void;
  onSave: (kmap: KeyMap) => void;
};

export interface ListenDialogStates {
  keyMap: KeyMap;
  isListening: boolean;
};

const ListenDialog = ({
  open,
  keyMap,
  currentPadPos,
  onOpenChange,
  onSave,
}: ListenDialogProps) => {
  const [state, dispatch] = useReducer(mockState<ListenDialogStates>, {
    keyMap: keyMap.find(e => e.id === padPosToId(currentPadPos)) ||
      EMPTY_KEYMAP,
    isListening: true,
  });

  useEffect(() => {
    if (!state.isListening) {
      return;
    }

    const l = listen<MidiEvent>('on_key_pressed', e => {
      dispatch(s => {
        return {
          ...s,
          keyMap: {
            ...s.keyMap,
            id: padPosToId(currentPadPos),
            key: formatKeyId(e.payload),
          },
          isListening: false,
        };
      });
    });

    return () => {
      l.then(f => f());
    };
  }, [state.isListening, currentPadPos]);

  const onSoundSelected = (value?: string) => {
    dispatch(s => {
      return {
        ...s,
        keyMap: {
          ...s.keyMap,
          sound: {
            path: value,
            name: getFileName(value),
          },
        },
      };
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>
          Setup the key pos: {padPosToId(currentPadPos)}
        </Dialog.Title>
        <Text as="div" size="2" mb="1" weight="bold">
          { state.isListening ? 'Press any key' : `Key: ${state.keyMap.key}` }
        </Text>

        <label>
          <Text as="div" size="2" mb="1" mt="3" weight="bold">
            Select a sound
          </Text>

          <FileButton
            value={state.keyMap.sound.path}
            onChange={onSoundSelected}
          />
        </label>

        <div className="flex gap-3 mt-2 justify-end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>

          <Button type="button" onClick={() => onSave(state.keyMap)}>
            Save
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ListenDialog;
