import { Euler } from './Euler';
import { EulerOrder } from './EulerOrder';
import { EulerUnit } from './EulerUnit';
import { Rotation } from './Rotation';
import { Vector3 } from './Vector3';
export declare class Quaternion extends Rotation {
    static fromAxisAngle(axis: Vector3, angle: number): Quaternion;
    static fromEuler(eulerr: Euler): Quaternion;
    static lookRotation(look: Vector3, up: Vector3): Quaternion;
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    readonly quat: Quaternion;
    getComponents(): number[];
    toEuler(order: EulerOrder, unit: EulerUnit): Euler;
    readonly lengthSq: number;
    readonly length: number;
    readonly normalized: Quaternion;
    readonly negated: Quaternion;
    readonly ban360s: Quaternion;
    multiply(br: Rotation): Quaternion;
    format(r: Rotation): Quaternion;
    slerp(br: Rotation, t: number): Quaternion;
    toMat3(): [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ];
}
