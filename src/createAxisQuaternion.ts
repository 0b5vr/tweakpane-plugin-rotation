import { Constraint, ValueMap } from '@tweakpane/core';
import { RotationInputAxis } from './RotationInputAxis';

export function createAxisQuaternion(
  constraint: Constraint<number> | undefined,
): RotationInputAxis {
  return {
    baseStep: 0.01,
    constraint: constraint,
    textProps: ValueMap.fromObject( {
      draggingScale: 0.01,
      formatter: ( value: number ): string => {
        if ( Math.abs( value ) < 0.995 ) {
          return value.toFixed( 2 ).replace( '0.', '.' );
        } else {
          return value.toFixed( 1 );
        }
      },
    } ),
  };
}
