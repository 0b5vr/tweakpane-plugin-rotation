import { saturate } from './saturate.js';

export function linearstep( a: number, b: number, x: number ): number {
  return saturate( ( x - a ) / ( b - a ) );
}
