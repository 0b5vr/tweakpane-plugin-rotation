import { Constraint, ValueMap, createNumberFormatter, getBaseStep, getSuitableDecimalDigits, getSuitableDraggingScale } from '@tweakpane/core';
import { RotationInputAxis } from './RotationInputAxis';

export function createAxis(
  initialValue: number,
  constraint: Constraint<number> | undefined,
): RotationInputAxis {
  return {
    baseStep: getBaseStep( constraint ),
    constraint: constraint,
    textProps: ValueMap.fromObject( {
      draggingScale: getSuitableDraggingScale( constraint, initialValue ),
      formatter: createNumberFormatter(
        getSuitableDecimalDigits( constraint, initialValue ),
      ),
    } ),
  };
}
