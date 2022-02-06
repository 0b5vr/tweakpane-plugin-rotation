import { Euler } from './Euler';
import type { EulerOrder } from './EulerOrder';
import type { EulerUnit } from './EulerUnit';
import type { PointNdAssembly } from '@tweakpane/core/dist/cjs/input-binding/common/model/point-nd';
export declare function createEulerAssembly(order: EulerOrder, unit: EulerUnit): PointNdAssembly<Euler>;
