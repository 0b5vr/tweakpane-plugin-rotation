import type { Euler } from './Euler.js';
import type { Parser, PickerLayout, Value, ViewProps } from '@tweakpane/core';
import type { PointNdAssembly } from '@tweakpane/core/dist/input-binding/common/model/point-nd.js';
import type { Quaternion } from './Quaternion.js';
import type { Rotation } from './Rotation.js';
import type { RotationInputAxis } from './RotationInputAxis.js';
import type { RotationInputRotationMode } from './RotationInputRotationMode.js';
export interface RotationInputControllerConfig {
    axes: RotationInputAxis[];
    assembly: PointNdAssembly<Quaternion> | PointNdAssembly<Euler>;
    expanded: boolean;
    parser: Parser<number>;
    pickerLayout: PickerLayout;
    rotationMode: RotationInputRotationMode;
    value: Value<Rotation>;
    viewProps: ViewProps;
}
