import { BaseInputParams, PickerLayout, PointDimensionParams } from '@tweakpane/core';
import { RotationInputRotationMode } from './RotationInputRotationMode';
export interface RotationInputPluginParams extends BaseInputParams {
    view: 'rotation';
    expanded?: boolean;
    picker?: PickerLayout;
    rotationMode?: RotationInputRotationMode;
    x?: PointDimensionParams;
    y?: PointDimensionParams;
    z?: PointDimensionParams;
    w?: PointDimensionParams;
}
