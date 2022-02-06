import { Euler } from './Euler';
import { EulerOrder } from './EulerOrder';
import { EulerUnit } from './EulerUnit';
import { PointNdAssembly } from '@tweakpane/core/dist/cjs/input-binding/common/model/point-nd';
export declare function createEulerAssembly(order: EulerOrder, unit: EulerUnit): PointNdAssembly<Euler>;
