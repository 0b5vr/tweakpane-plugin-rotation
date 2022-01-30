import { Vector3 } from './Vector3';

export function createArcVerticesArray(
  thetaStart: number,
  thetaLength: number,
  segments: number,
  cosAxis: 'x' | 'y' | 'z',
  sinAxis: 'x' | 'y' | 'z',
): Vector3[] {
  const vertices: Vector3[] = [];

  for ( let i = 0; i < segments; i ++ ) {
    const t = thetaStart + thetaLength * i / ( segments - 1 );
    const vector = new Vector3();
    vector[ cosAxis ] = Math.cos( t );
    vector[ sinAxis ] = Math.sin( t );
    vertices.push( vector );
  }

  return vertices;
}
