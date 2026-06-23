import { useEffect, useReducer } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Select, Button, IconButton, Text } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { classNames, mockState } from '@junipero/react';

import { useApp } from '../../services/hooks';
import Launchpad from '../Launchpad';
import { KeyMap } from '../../types';
import ConfirmDialog from '../ConfirmDialog';

export interface HomeState {
  keyMap: KeyMap[];
  oldKeyMap: KeyMap[];
  selectedDevice?: number;
  selectedOutput?: string;
  clearDialogOpened: boolean;
  saveDialogOpened: boolean;
  dirty: boolean;
}

const Home = () => {
  const { keyMap, setKeyMap, midiDevices, audioOutputs, listMidi } = useApp();
  const [state, dispatch] = useReducer(mockState<HomeState>, {
    keyMap: keyMap,
    oldKeyMap: keyMap,
    selectedDevice: undefined,
    selectedOutput: undefined,
    clearDialogOpened: false,
    saveDialogOpened: false,
    dirty: false,
  });

  useEffect(() => {
    dispatch({ keyMap, oldKeyMap: keyMap });
  }, [keyMap]);

  const fetchMidiDevices = (open: boolean) => {
    if (!open) {
      return;
    }

    listMidi();
  };

  const onSelectDevice = async (deviceIndex: string) => {
    const index = Number(deviceIndex);

    try {
      await invoke('on_device_selected', { index: index });
      dispatch({ selectedDevice: index });
    } catch (e) {
      console.error(e);
    }
  };

  const onSelectOutput = async (outputId: string) => {
    try {
      const output = audioOutputs.find(e => e.id === outputId);

      if (!output) {
        return;
      }

      await invoke('on_output_selected', { output });
      dispatch({ selectedOutput: outputId });
    } catch (e) {
      console.error(e);
    }
  };

  const onSaveConfig = async () => {
    try {
      await invoke('save_keymap', { kmap: state.keyMap });
      setKeyMap(state.keyMap);
      dispatch({ dirty: false, saveDialogOpened: false });
    } catch (e) {
      console.error(e);
    }
  };

  const onClearMap = async () => {
    try {
      await invoke('remove_all_keymap');
      setKeyMap([]);
      dispatch({ dirty: false, clearDialogOpened: false });
    } catch (e) {
      console.error(e);
    }
  };

  const onCancel = () => {
    dispatch({ keyMap: state.oldKeyMap, dirty: false });
  };

  const onAddKey = (kmap: KeyMap) => {
    const exists = state.keyMap.findIndex((e: KeyMap) => e.id === kmap.id);

    if (exists == null || exists == undefined) {
      return;
    }

    const newMap = state.keyMap.toSpliced(exists, exists > -1 ? 1 : 0, kmap);
    dispatch({ dirty: true, keyMap: newMap });
  };

  const onRemoveKey = async (kmap: KeyMap) => {
    const exists = state.keyMap.findIndex((e: KeyMap) => e.id === kmap.id);

    if (exists == null || exists == undefined) {
      return;
    }

    const newMap = state.keyMap.toSpliced(exists, exists > -1 ? 1 : 0);
    dispatch({
      dirty: newMap.length !== keyMap.length,
      keyMap: newMap,
    });
  };

  const openClearDialog = () => {
    dispatch({ clearDialogOpened: true });
  };

  const openSaveDialog = () => {
    dispatch({ saveDialogOpened: true });
  };

  const closeDialogs = () => {
    dispatch({ clearDialogOpened: false, saveDialogOpened: false });
  };

  return (
    <>
      <div className={classNames(
        'font-chakra bg-porcelain text-gunmetal flex uppercase'
      )}
      >
        <div className={classNames(
          'flex flex-col p-8 gap-8 h-screen border-r border-gunmetal'
        )}
        >
          <img
            className="w-34.5 h-auto"
            src="src/assets/sm-001.svg"
            alt="Logo"
          />

          <div className="flex flex-col gap-4">
            <p className="font-semibold italic">MIDI Device</p>
            <Select.Root
              onValueChange={onSelectDevice}
              onOpenChange={fetchMidiDevices}
            >
              <Select.Trigger
                className="bg-porcelain! border-gunmetal! border! rounded-none!"
                placeholder="select A Midi DEVICE"
              />
              <Select.Content>
                { midiDevices.map((d, i) => (
                  <Select.Item key={i} value={d?.index.toString()}>
                    { d?.name }
                  </Select.Item>
                )) }
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold italic">Audio output</p>
            <Select.Root onValueChange={onSelectOutput}>
              <Select.Trigger
                className="bg-porcelain! border-gunmetal! border! rounded-none!"
                placeholder="Select output audio"
              />
              <Select.Content>
                { audioOutputs.map((d, i) => (
                  <Select.Item key={i} value={d?.id}>
                    { d?.name }
                  </Select.Item>
                )) }
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold italic">My Soundboard</p>
            <Button
              className={classNames(
                'font-chakra! rounded-none! bg-lipstick-red! text-porcelain!'
              )}
              onClick={openClearDialog}
            >
              Reset the soundboard
            </Button>
          </div>
        </div>
        <div className={classNames(
          'flex items-center justify-center h-screen w-full bg-porcelain',
          'bg-[radial-gradient(#3C3C3C1A_1px,transparent_1px)]',
          'bg-size-[16px_16px]'
        )}
        >
          <Launchpad
            onAddKey={onAddKey}
            onRemoveKey={onRemoveKey}
            keyMap={state.keyMap}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
