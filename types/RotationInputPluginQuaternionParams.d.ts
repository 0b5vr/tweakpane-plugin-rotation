import type { BaseInputParams, PickerLayout, PointDimensionParams } from '@tweakpane/core';
export interface RotationInputPluginQuaternionParams extends BaseInputParams {
    view: 'rotation';
    expanded?: boolean;
    picker?: PickerLayout;
    rotationMode?: 'quaternion';
    x?: PointDimensionParams;
    y?: PointDimensionParams;
    z?: PointDimensionParams;
    w?: PointDimensionParams;
}
