import { Euler } from './Euler.js';
import type { EulerOrder } from './EulerOrder.js';
import type { EulerUnit } from './EulerUnit.js';
import type { PointNdAssembly } from '@tweakpane/core/dist/input-binding/common/model/point-nd.js';
export declare function createEulerAssembly(order: EulerOrder, unit: EulerUnit): PointNdAssembly<Euler>;
