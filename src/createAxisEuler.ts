import { Constraint, ValueMap, createNumberFormatter } from '@tweakpane/core';
import { RotationInputAxis } from './RotationInputAxis.js';

export function createAxisEuler(
  digits: number,
  constraint: Constraint<number> | undefined,
): RotationInputAxis {
  const step = Math.pow( 0.1, digits );

  return {
    baseStep: step,
    constraint: constraint,
    textProps: ValueMap.fromObject( {
      formatter: createNumberFormatter( digits ),
      keyScale: step,
      pointerScale: step,
    } ),
  };
}
