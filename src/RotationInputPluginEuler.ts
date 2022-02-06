import { BindingTarget, InputBindingPlugin, ParamsParsers, PointNdConstraint, TpError, parseNumber, parseParams, parsePickerLayout, parsePointDimensionParams } from '@tweakpane/core';
import { Euler } from './Euler';
import { EulerAssembly } from './EulerAssembly';
import { RotationInputController } from './RotationInputController';
import { createAxis } from './createAxis';
import { createDimensionConstraint } from './createDimensionConstraint';
import { parseEuler } from './parseEuler';
import { parseEulerOrder } from './parseEulerOrder';
import type { RotationInputPluginEulerParams } from './RotationInputPluginEulerParams';

export const RotationInputPluginEuler: InputBindingPlugin<
Euler,
Euler,
RotationInputPluginEulerParams
> = {
  id: 'rotation',
  type: 'input',
  css: '__css__',

  accept( exValue: unknown, params: Record<string, unknown> ) {
    // Parse parameters object
    const p = ParamsParsers;
    const result = parseParams<RotationInputPluginEulerParams>( params, {
      view: p.required.constant( 'rotation' ),
      label: p.optional.string,
      picker: p.optional.custom( parsePickerLayout ),
      expanded: p.optional.boolean,
      rotationMode: p.required.constant( 'euler' ),
      x: p.optional.custom( parsePointDimensionParams ),
      y: p.optional.custom( parsePointDimensionParams ),
      z: p.optional.custom( parsePointDimensionParams ),
      order: p.optional.custom( parseEulerOrder ),
    } );

    return result ? {
      initialValue: parseEuler( exValue, result.order ?? 'XYZ' ),
      params: result,
    } : null;
  },

  binding: {
    reader( { params } ) {
      return ( exValue: unknown ): Euler => {
        return parseEuler( exValue, params.order ?? 'XYZ' );
      };
    },

    constraint( { params } ) {
      return new PointNdConstraint( {
        assembly: EulerAssembly,
        components: [
          createDimensionConstraint( 'x' in params ? params.x : undefined ),
          createDimensionConstraint( 'y' in params ? params.y : undefined ),
          createDimensionConstraint( 'z' in params ? params.z : undefined ),
        ]
      } );
    },

    writer( _args ) {
      return ( target: BindingTarget, inValue: Euler ) => {
        target.writeProperty( 'x', inValue.x );
        target.writeProperty( 'y', inValue.y );
        target.writeProperty( 'z', inValue.z );
      };
    },
  },

  controller( { document, value, constraint, params, viewProps } ) {
    if ( !( constraint instanceof PointNdConstraint ) ) {
      throw TpError.shouldNeverHappen();
    }

    const expanded = 'expanded' in params ? params.expanded : undefined;
    const picker = 'picker' in params ? params.picker : undefined;

    return new RotationInputController( document, {
      axes: [
        createAxis( value.rawValue.x, constraint.components[ 0 ] ),
        createAxis( value.rawValue.y, constraint.components[ 1 ] ),
        createAxis( value.rawValue.z, constraint.components[ 2 ] ),
      ],
      assembly: EulerAssembly,
      rotationMode: 'euler',
      expanded: expanded ?? false,
      parser: parseNumber,
      pickerLayout: picker ?? 'popup',
      value,
      viewProps: viewProps,
    } );
  },
};
