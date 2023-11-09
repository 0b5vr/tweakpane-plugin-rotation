import { Vector3 } from './Vector3.js';
export declare class PointProjector {
    offset: [number, number, number];
    fov: number;
    aspect: number;
    viewport: [number, number, number, number];
    constructor();
    project(v: Vector3): [number, number];
}
