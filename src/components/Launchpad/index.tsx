import { classNames, mockState } from '@junipero/react';
import { useReducer } from 'react';

import ListenDialog from '../ListenDialog';
import { KeyMap } from '../../types';
import { padPosToId } from '../../services/utils';

export type PadPosition = {
  row: number
  col: number
};

export interface LaunchpadProps {
  keyMap: KeyMap[];
  onChange: (kmap: KeyMap) => void;
}

export interface LaunchpadState {
  isDialogOpen: boolean;
  currentPadPos?: PadPosition;
}

const Launchpad = ({
  keyMap,
  onChange
}: LaunchpadProps) => {
  const [state, dispatch] = useReducer(mockState<LaunchpadState>, {
    isDialogOpen: false,
    currentPadPos: undefined,
  });

  const handlePadClick = (row: number, col: number) => {
    dispatch({ currentPadPos: { row, col }, isDialogOpen: true });
  };

  const onOpenDialogChange = (open: boolean) => {
    dispatch({ isDialogOpen: open });
  };

  const onSaveKey = (kmap: KeyMap) => {
    onChange(kmap);
    dispatch({ isDialogOpen: false });
  };

  const getPadColor = (row: number, col: number) => {
    const colors = [
      'bg-red-500 hover:bg-red-400',
      'bg-orange-500 hover:bg-orange-400',
      'bg-amber-500 hover:bg-amber-400',
      'bg-yellow-500 hover:bg-yellow-400',
      'bg-lime-500 hover:bg-lime-400',
      'bg-green-500 hover:bg-green-400',
      'bg-emerald-500 hover:bg-emerald-400',
      'bg-cyan-500 hover:bg-cyan-400',
    ];

    return colors[col % colors.length];
  };


  return (
    <div className="p-4">
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const padId = padPosToId({ row, col });

            return (
              <div
                key={padId}
                onClick={() => handlePadClick(row, col)}
                className={classNames(
                  'w-12 h-12 sm:w-18 sm:h-18 md:w-20 md:h-20',
                  `rounded-lg ${getPadColor(row, col)} cursor-pointer`,
                  'transition-all duration-75 shadow-lg active:scale-90',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'flex items-center justify-center p-1',
                )}
              >
                <span className={classNames(
                  'text-[8px] sm:text-[9px] md:text-[10px] font-bold',
                  'text-center truncate text-white',
                )}
                >
                  { keyMap.find(e => e.id === padId)?.sound.name }
                </span>
              </div>
            );
          })
        )}
      </div>

      {state.isDialogOpen && (
        <ListenDialog
          open={state.isDialogOpen}
          keyMap={keyMap}
          currentPadPos={state.currentPadPos}
          onOpenChange={onOpenDialogChange}
          onSave={onSaveKey}
        />
      )}
    </div>
  );
};

export default Launchpad;
