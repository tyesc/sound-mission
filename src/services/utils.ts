import { MidiBytes } from '../types';

export const formatKeyId = (bytes: MidiBytes): number => {
  // cc = Control Change, key, velocity
  const { cc, note } = bytes;

  return Number(`${cc}${note}`);
};
