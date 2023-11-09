import { Quaternion } from './Quaternion.js';
export declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    getComponents(): number[];
    get lengthSq(): number;
    get length(): number;
    get normalized(): Vector3;
    get negated(): Vector3;
    add(v: Vector3): Vector3;
    sub(v: Vector3): Vector3;
    scale(s: number): Vector3;
    dot(v: Vector3): number;
    cross(v: Vector3): Vector3;
    orthoNormalize(tangent: Vector3): {
        normal: Vector3;
        tangent: Vector3;
        binormal: Vector3;
    };
    applyQuaternion(q: Quaternion): Vector3;
}
