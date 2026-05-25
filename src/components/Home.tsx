import { useEffect, useReducer } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { Select } from '@radix-ui/themes';
import { mockState } from '@junipero/react';

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
  outputs: Output[],
  selectedOutput?: string,
  keylog: string[],
}

const Home = () => {
  const [state, dispatch] = useReducer(mockState<HomeState>, {
    devices: [],
    selectedDevice: undefined,
    outputs: [],
    selectedOutput: undefined,
    keylog: [],
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

  useEffect(() => {
    const l = listen<string>('on_key_pressed', e => {
      dispatch(s => {
        return {
          ...s,
          keylog: s.keylog.concat([e.payload]),
        };
      });
    });

    return () => {
      l.then(f => f());
    };
  }, []);

  const onSelectDevice = async (deviceId: string) => {
    dispatch({ selectedDevice: deviceId });
    await invoke('on_device_selected', { id: deviceId });
  };

  const onSelectOutput = async (outputId: string) => {
    dispatch({ selectedOutput: outputId });
  };

  return (
    <div className="flex flex-col gap-1 items-center w-full h-full!">
      <Select.Root onValueChange={onSelectDevice}>
        <Select.Trigger placeholder="Select device input" />
        <Select.Content>
          {state.devices.map((d, i) => (
            <Select.Item key={i} value={d?.id}>
              { d?.name }
            </Select.Item>
          )) }
        </Select.Content>
      </Select.Root>

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

      <div className="max-h-28 overflow-auto">
        <ul>
          {state.keylog.map((e, i) => (
            <li key={i}>{ e }</li>
          )) }
        </ul>
      </div>

      <div className="flex gap-0.5 justify-center relative w-full h-full mt-3">
        { [...Array(15)].map((_, i) => (
          <div
            key={i}
            className="bg-sky-500/50 min-w-8 min-h-8"
            onClick={listOutput}
          />
        )) }
      </div>
    </div>
  );
};

export default Home;
