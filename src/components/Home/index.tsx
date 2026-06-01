import { SubmitEvent, useEffect, useReducer } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Select, Button } from '@radix-ui/themes';
import { mockState } from '@junipero/react';

import { useApp } from '../../services/hooks';
import Launchpad from '../Launchpad';

type Input = {
  name: string;
  index: number;
};

type Output = {
  name: string;
  id: string;
};

export interface HomeState {
  devices: Input[];
  selectedDevice?: number;
  outputs: Output[];
  selectedOutput?: string;
  dialogOpened: boolean
  keyIndex: number;
}

const Home = () => {
  const { keyMap, setKeyMap } = useApp();
  const [state, dispatch] = useReducer(mockState<HomeState>, {
    devices: [],
    selectedDevice: undefined,
    outputs: [],
    selectedOutput: undefined,
    dialogOpened: false,
    keyIndex: NaN,
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

  const onSelectDevice = async (deviceIndex: string) => {
    const index = Number(deviceIndex);
    dispatch({ selectedDevice: index });
    await invoke('on_device_selected', { index: index });
  };

  const onSelectOutput = async (outputId: string) => {
    dispatch({ selectedOutput: outputId });
  };

  const onSaveConfig = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      await invoke('save_keymap', { kmap: keyMap });
    } catch (e) {
      console.error(e);
    }
  };

  const onClearMap = async () => {
    try {
      await invoke('save_keymap', { kmap: [] });
      setKeyMap?.([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <form
        onSubmit={onSaveConfig}
        className="flex flex-col gap-1 items-center w-full h-full! p-4"
      >
        <div className="flex gap-1 justify-between w-full h-full!">

          <Select.Root onValueChange={onSelectDevice}>
            <Select.Trigger placeholder="Select device midi" />
            <Select.Content>
              {state.devices.map((d, i) => (
                <Select.Item key={i} value={d?.index.toString()}>
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

        <Launchpad />

        <div
          className="flex gap-0.5 justify-end w-full align-bottom"
        >
          <Button
            variant="soft"
            color="gray"
            type="button"
            onClick={onClearMap}
          >
            Clear
          </Button>

          <Button type="submit">Save</Button>
        </div>
      </form>
    </>
  );
};

export default Home;
