import type { Parser, PickerLayout, Value, ViewProps } from '@tweakpane/core';
import type { Quaternion } from './Quaternion';
import type { RotationInputAxis } from './RotationInputAxis';
import type { RotationInputRotationMode } from './RotationInputRotationMode';
export interface RotationInputControllerConfig {
    axes: [RotationInputAxis, RotationInputAxis, RotationInputAxis, RotationInputAxis];
    expanded: boolean;
    parser: Parser<number>;
    pickerLayout: PickerLayout;
    rotationMode: RotationInputRotationMode;
    value: Value<Quaternion>;
    viewProps: ViewProps;
}
