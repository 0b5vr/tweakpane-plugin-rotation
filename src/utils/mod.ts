import { lofi } from './lofi';

export function mod( x: number, d: number ): number {
  return x - lofi( x, d );
}
