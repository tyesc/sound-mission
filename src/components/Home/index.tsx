import { useEffect, useReducer } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Select, Button, IconButton, Text } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { mockState } from '@junipero/react';

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
  const { keyMap, setKeyMap, midiDevices, audioOutputs } = useApp();
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

  const onSelectDevice = async (deviceIndex: string) => {
    const index = Number(deviceIndex);
    dispatch({ selectedDevice: index });
    await invoke('on_device_selected', { index: index });
  };

  const onSelectOutput = async (outputId: string) => {
    dispatch({ selectedOutput: outputId });
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
      await invoke('save_keymap', { kmap: [] });
      setKeyMap([]);
      dispatch({ dirty: false, clearDialogOpened: false });
    } catch (e) {
      console.error(e);
    }
  };

  const onCancel = () => {
    dispatch({ keyMap: state.oldKeyMap, dirty: false });
  };

  const onChange = (kmap: KeyMap) => {
    const exists = state.keyMap.findIndex((e: KeyMap) => e.id === kmap.id);

    if (exists == null || exists == undefined) {
      return;
    }

    const newMap = state.keyMap.toSpliced(exists, exists > -1 ? 1 : 0, kmap);
    dispatch({ dirty: true, keyMap: newMap });
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
      <div className="flex flex-col gap-1 items-center w-full h-full! p-4">
        <div className="flex gap-1 justify-between w-full h-full!">
          <div className="flex gap-2">
            <Select.Root onValueChange={onSelectDevice}>
              <Select.Trigger placeholder="⚠️ Select device midi" />
              <Select.Content>
                { midiDevices.map((d, i) => (
                  <Select.Item key={i} value={d?.index.toString()}>
                    { d?.name }
                  </Select.Item>
                )) }
              </Select.Content>
            </Select.Root>
            <Select.Root onValueChange={onSelectOutput} disabled>
              <Select.Trigger placeholder="Select output audio" />
              <Select.Content>
                { audioOutputs.map((d, i) => (
                  <Select.Item key={i} value={d?.id}>
                    { d?.name }
                  </Select.Item>
                )) }
              </Select.Content>
            </Select.Root>
          </div>

          <IconButton
            onClick={openClearDialog}
            color="crimson"
            disabled={keyMap.length === 0}
          >
            <TrashIcon />
          </IconButton>
        </div>

        <Launchpad
          onChange={onChange}
          keyMap={state.keyMap}
        />

        <div
          className="flex gap-1 justify-end w-full align-bottom"
        >
          { state.dirty && (
            <Text size="1" color="gray" className="self-center">
              { '⚠️ Don\'t forget to save to hear your update' }
            </Text>
          ) }

          <Button
            variant="soft"
            color="gray"
            type="button"
            disabled={!state.dirty}
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!state.dirty}
            onClick={openSaveDialog}
          >
            Save
          </Button>
        </div>
      </div>

      { state.clearDialogOpened && (
        <ConfirmDialog
          open={state.clearDialogOpened}
          title="Clear the entire keymap ?"
          desc="Are you sure, you want to erase the keymap ? It's irreversible"
          onConfirm={onClearMap}
          onCancel={closeDialogs}
        />
      ) }

      { state.saveDialogOpened && (
        <ConfirmDialog
          open={state.saveDialogOpened}
          title="You want to save the current keymap ?"
          desc="Are you reeeeeeaaaaaaalllllyyyy sure ?"
          onConfirm={onSaveConfig}
          onCancel={closeDialogs}
        />
      ) }
    </>
  );
};

export default Home;
