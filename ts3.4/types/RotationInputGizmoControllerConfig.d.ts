import { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import { Rotation } from './Rotation';
export interface RotationInputGizmoControllerConfig {
    value: Value<Rotation>;
    viewProps: ViewProps;
    pickerLayout: PickerLayout;
}
