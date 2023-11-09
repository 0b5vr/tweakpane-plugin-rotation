import { Euler } from './Euler.js';
import { EulerOrder } from './EulerOrder.js';
import { EulerUnit } from './EulerUnit.js';
import { Rotation } from './Rotation.js';
import { Vector3 } from './Vector3.js';
export declare class Quaternion extends Rotation {
    static fromAxisAngle(axis: Vector3, angle: number): Quaternion;
    static fromEuler(eulerr: Euler): Quaternion;
    static lookRotation(look: Vector3, up: Vector3): Quaternion;
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    get quat(): Quaternion;
    getComponents(): number[];
    toEuler(order: EulerOrder, unit: EulerUnit): Euler;
    get lengthSq(): number;
    get length(): number;
    get normalized(): Quaternion;
    get negated(): Quaternion;
    get ban360s(): Quaternion;
    multiply(br: Rotation): Quaternion;
    format(r: Rotation): Quaternion;
    slerp(br: Rotation, t: number): Quaternion;
    toMat3(): [number, number, number, number, number, number, number, number, number];
}
