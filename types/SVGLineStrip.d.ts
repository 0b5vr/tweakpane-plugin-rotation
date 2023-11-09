import { Vector3 } from './Vector3.js';
import type { PointProjector } from './PointProjector.js';
import type { Quaternion } from './Quaternion.js';
export declare class SVGLineStrip {
    element: SVGPathElement;
    vertices: Vector3[];
    projector: PointProjector;
    constructor(doc: Document, vertices: Vector3[], projector: PointProjector);
    /**
     * Make sure rotation is normalized!
     */
    setRotation(rotation: Quaternion): this;
}
