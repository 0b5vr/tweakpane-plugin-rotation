import { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
export interface RotationInputGizmoControllerConfig {
    value: Value<Quaternion>;
    viewProps: ViewProps;
    pickerLayout: PickerLayout;
}
