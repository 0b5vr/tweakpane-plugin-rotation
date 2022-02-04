import { Constraint } from '@tweakpane/core';
import { NumberTextProps } from '@tweakpane/core';
export interface RotationInputAxis {
    baseStep: number;
    constraint: Constraint<number> | undefined;
    textProps: NumberTextProps;
}
