import { Vector3 } from './Vector3';
export declare class Quaternion {
    static fromAxisAngle(axis: Vector3, angle: number): Quaternion;
    static lookRotation(look: Vector3, up: Vector3): Quaternion;
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    getComponents(): number[];
    get lengthSq(): number;
    get length(): number;
    get normalized(): Quaternion;
    get negated(): Quaternion;
    get ban360s(): Quaternion;
    multiply(q: Quaternion): Quaternion;
    slerp(b: Quaternion, t: number): Quaternion;
}
