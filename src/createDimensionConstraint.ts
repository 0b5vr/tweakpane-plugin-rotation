import { CompositeConstraint, Constraint, PointDimensionParams, RangeConstraint, StepConstraint, isEmpty } from '@tweakpane/core';

export function createDimensionConstraint(
  params: PointDimensionParams | undefined,
): Constraint<number> | undefined {
  if ( !params ) {
    return undefined;
  }

  const constraints: Constraint<number>[] = [];

  if ( !isEmpty( params.step ) ) {
    constraints.push( new StepConstraint( params.step ) );
  }
  if ( !isEmpty( params.max ) || !isEmpty( params.min ) ) {
    constraints.push(
      new RangeConstraint( {
        max: params.max,
        min: params.min,
      } ),
    );
  }
  return new CompositeConstraint( constraints );
}
