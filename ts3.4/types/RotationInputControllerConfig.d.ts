import { Parser, PickerLayout, Value, ViewProps } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
import { RotationInputAxis } from './RotationInputAxis';
import { RotationInputRotationMode } from './RotationInputRotationMode';
export interface RotationInputControllerConfig {
    axes: [
        RotationInputAxis,
        RotationInputAxis,
        RotationInputAxis,
        RotationInputAxis
    ];
    expanded: boolean;
    parser: Parser<number>;
    pickerLayout: PickerLayout;
    rotationMode: RotationInputRotationMode;
    value: Value<Quaternion>;
    viewProps: ViewProps;
}
