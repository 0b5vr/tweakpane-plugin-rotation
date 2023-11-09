import type { Foldable, PickerLayout } from '@tweakpane/core';
import type { RotationInputRotationMode } from './RotationInputRotationMode.js';
export interface RotationInputViewConfig {
    rotationMode: RotationInputRotationMode;
    foldable: Foldable;
    pickerLayout: PickerLayout;
}
