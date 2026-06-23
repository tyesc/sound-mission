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
  onAddKey: (kmap: KeyMap) => void;
  onRemoveKey: (kmap: KeyMap) => void;
}

export interface LaunchpadState {
  isDialogOpen: boolean;
  currentPadPos?: PadPosition;
}

const Launchpad = ({
  keyMap,
  onAddKey,
  onRemoveKey,
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
    onAddKey(kmap);
    dispatch({ isDialogOpen: false });
  };

  const _onRemoveKey = (kmap: KeyMap) => {
    onRemoveKey(kmap);
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
    <div className="p-8 bg-porcelain border border-gunmetal rounded-lg">
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => {
            const padId = padPosToId({ row, col });

            return (
              <div
                key={padId}
                onClick={() => handlePadClick(row, col)}
                className={classNames(
                  'w-16 h-16 rounded-sm',
                  'bg-porcelain cursor-pointer border border-gunmetal',
                  'transition-all duration-75 active:scale-90 flex',
                  'items-center justify-center p-1',
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
          onRemove={_onRemoveKey}
          onOpenChange={onOpenDialogChange}
          onSave={onSaveKey}
        />
      )}
    </div>
  );
};

export default Launchpad;
