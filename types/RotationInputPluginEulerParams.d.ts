import type { BaseInputParams, PickerLayout, PointDimensionParams } from '@tweakpane/core';
import type { EulerOrder } from './EulerOrder.js';
import type { EulerUnit } from './EulerUnit.js';
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
