import { MidiBytes } from '../types';

export const formatKeyId = (bytes: MidiBytes): number => {
  // cc = Control Change, key, velocity
  const { cc, note } = bytes;

  return Number(`${cc}${note}`);
};

export const getFileName = (s?: string) => {
  if (!s) return 'No file';

  return s.split(/[\\/]/).pop();
};
