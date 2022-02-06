import { BaseInputParams, PickerLayout, PointDimensionParams } from '@tweakpane/core';
import { EulerOrder } from './EulerOrder';
import { EulerUnit } from './EulerUnit';
export interface RotationInputPluginEulerParams extends BaseInputParams {
    view: 'rotation';
    expanded?: boolean;
    picker?: PickerLayout;
    rotationMode: 'euler';
    order?: EulerOrder;
    unit?: EulerUnit;
    x?: PointDimensionParams;
    y?: PointDimensionParams;
    z?: PointDimensionParams;
}
