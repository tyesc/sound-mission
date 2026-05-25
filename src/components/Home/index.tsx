import { SubmitEvent, useEffect, useReducer } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Select } from '@radix-ui/themes';
import { mockState } from '@junipero/react';

import ListenDialog from '../ListenDialog';
import { KeyMap } from '../../types';

type Input = {
  name: string;
  id: string;
};

type Output = {
  name: string;
  id: string;
};

export interface HomeState {
  devices: Input[];
  selectedDevice?: string;
  outputs: Output[];
  selectedOutput?: string;
  dialogOpened: boolean
  keyIndex?: number;
  keyMap: KeyMap[];
}

const Home = () => {
  const [state, dispatch] = useReducer(mockState<HomeState>, {
    devices: [],
    selectedDevice: undefined,
    outputs: [],
    selectedOutput: undefined,
    dialogOpened: false,
    keyIndex: undefined,
    keyMap: [],
  });

  const listMidi = async () => {
    try {
      const devices = await invoke<Input[]>('list_devices');

      dispatch({ devices });
    } catch (e) {
      console.error('TAURI ERROR:', e);
    }
  };

  const listOutput = async () => {
    try {
      const outputs = await invoke<Output[]>('list_outputs_audio');

      dispatch({ outputs });
    } catch (e) {
      console.error('TAURI ERROR:', e);
    }
  };

  useEffect(() => {
    listMidi();
    listOutput();
  }, []);

  const onSelectDevice = async (deviceId: string) => {
    dispatch({ selectedDevice: deviceId });
    await invoke('on_device_selected', { id: deviceId });
  };

  const onSelectOutput = async (outputId: string) => {
    dispatch({ selectedOutput: outputId });
  };

  const onOpenDialog = (index: number) => {
    dispatch({ dialogOpened: true, keyIndex: index });
  };

  const onDialogOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      return;
    }

    dispatch({ dialogOpened: false });
  };

  const onSaveKey = (e: SubmitEvent, kmap: KeyMap) => {
    e.preventDefault();

    dispatch(s => {
      return {
        ...s,
        keyMap: s.keyMap.concat(kmap),
        dialogOpened: false,
      };
    });
  };

  return (
    <>
      <div className="flex flex-col gap-1 items-center w-full h-full!">
        <div className="flex gap-1 justify-between w-full h-full!">

          <Select.Root onValueChange={onSelectDevice}>
            <Select.Trigger placeholder="Select device midi" />
            <Select.Content>
              {state.devices.map((d, i) => (
                <Select.Item key={i} value={d?.id}>
                  { d?.name }
                </Select.Item>
              )) }
            </Select.Content>
          </Select.Root>

          <div>
            <Select.Root onValueChange={onSelectOutput}>
              <Select.Trigger placeholder="Select output audio" />
              <Select.Content>
                {state.outputs.map((d, i) => (
                  <Select.Item key={i} value={d?.id}>
                    { d?.name }
                  </Select.Item>
                )) }
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <div
          className="flex gap-0.5 justify-center relative w-full h-full mt-3"
        >
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="bg-sky-500/50 min-w-12 min-h-40"
              onClick={onOpenDialog.bind(null, i)}
            >
              <label>
                { state.keyMap.find(e => e.index === i)?.key.id }
              </label>
            </div>
          )) }
        </div>
      </div>

      {state.dialogOpened && (
        <ListenDialog
          open={state.dialogOpened}
          keyIndex={state.keyIndex}
          onOpenChange={onDialogOpenChange}
          onSave={onSaveKey}
        />
      ) }
    </>
  );
};

export default Home;
