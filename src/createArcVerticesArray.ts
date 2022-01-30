import { Vector3 } from './Vector3';

export function createArcVerticesArray(
  thetaStart: number,
  thetaLength: number,
  segments: number,
  cosAxis: 'x' | 'y' | 'z',
  sinAxis: 'x' | 'y' | 'z',
  radius: number = 1.0,
): Vector3[] {
  const vertices: Vector3[] = [];

  for ( let i = 0; i < segments; i ++ ) {
    const t = thetaStart + thetaLength * i / ( segments - 1 );
    const vector = new Vector3();
    vector[ cosAxis ] = radius * Math.cos( t );
    vector[ sinAxis ] = radius * Math.sin( t );
    vertices.push( vector );
  }

  return vertices;
}
