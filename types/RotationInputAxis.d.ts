import type { Constraint } from '@tweakpane/core';
import type { NumberTextProps } from '@tweakpane/core';
export interface RotationInputAxis {
    baseStep: number;
    constraint: Constraint<number> | undefined;
    textProps: NumberTextProps;
}
