import { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import { Rotation } from './Rotation';
export interface RotationInputGizmoViewConfig {
    value: Value<Rotation>;
    mode: Value<'free' | 'angle-x' | 'angle-y' | 'angle-z' | 'angle-r' | 'auto'>;
    viewProps: ViewProps;
    pickerLayout: PickerLayout;
}
