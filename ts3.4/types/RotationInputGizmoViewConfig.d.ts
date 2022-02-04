import { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
export interface RotationInputGizmoViewConfig {
    value: Value<Quaternion>;
    mode: Value<'free' | 'angle-x' | 'angle-y' | 'angle-z' | 'angle-r' | 'auto'>;
    viewProps: ViewProps;
    pickerLayout: PickerLayout;
}
