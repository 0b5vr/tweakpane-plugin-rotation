import type { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import type { Rotation } from './Rotation.js';
export interface RotationInputGizmoControllerConfig {
    value: Value<Rotation>;
    viewProps: ViewProps;
    pickerLayout: PickerLayout;
}
