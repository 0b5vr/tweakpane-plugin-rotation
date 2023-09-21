import { SVG_NS } from '@tweakpane/core';
import { Vector3 } from './Vector3.js';
import type { PointProjector } from './PointProjector.js';
import type { Quaternion } from './Quaternion.js';

export class SVGLineStrip {
  public element: SVGPathElement;
  public vertices: Vector3[];
  public projector: PointProjector;

  public constructor(
    doc: Document,
    vertices: Vector3[],
    projector: PointProjector,
  ) {
    this.element = doc.createElementNS( SVG_NS, 'path' );
    this.vertices = vertices;
    this.projector = projector;
  }

  /**
   * Make sure rotation is normalized!
   */
  public setRotation( rotation: Quaternion ): this {
    let pathStr = '';

    this.vertices.forEach( ( vertex, iVertex ) => {
      const transformed = vertex.applyQuaternion( rotation );
      const [ sx, sy ] = this.projector.project( transformed );
      const cmd = iVertex === 0 ? 'M' : 'L';
      pathStr += `${ cmd }${ sx } ${ sy }`;
    } );

    this.element.setAttributeNS( null, 'd', pathStr );

    return this;
  }
}
