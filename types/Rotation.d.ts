import { Euler } from './Euler.js';
import { EulerOrder } from './EulerOrder.js';
import { EulerUnit } from './EulerUnit.js';
import { Quaternion } from './Quaternion.js';
export declare abstract class Rotation {
    abstract get quat(): Quaternion;
    abstract toEuler(order: EulerOrder, unit: EulerUnit): Euler;
    /**
     * Convert the input rotation to the format compatible with this rotation.
     */
    abstract format(r: Rotation): Rotation;
    multiply(b: Rotation): Rotation;
    premultiply(a: Rotation): Rotation;
    slerp(b: Rotation, t: number): Rotation;
}
