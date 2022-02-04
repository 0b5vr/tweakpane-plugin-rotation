import { Vector3 } from './Vector3';
import { PointProjector } from './PointProjector';
import { Quaternion } from './Quaternion';
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
