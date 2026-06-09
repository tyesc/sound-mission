import { PadPosition } from '../components/Launchpad';
import { MidiEvent } from '../types';

export const formatKeyId = (e: MidiEvent): string => {
  return `${e.kind}:${e.channel}:${e.number}`;
};

export const getFileName = (s?: string) => {
  if (!s) return 'No file';

  return s.split(/[\\/]/).pop();
};

export const padPosToId = (pos?: PadPosition): string =>
  `${pos?.row}:${pos?.col}`;
