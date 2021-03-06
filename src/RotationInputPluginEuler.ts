import { BindingTarget, InputBindingPlugin, ParamsParsers, PointNdConstraint, TpError, parseNumber, parseParams, parsePickerLayout, parsePointDimensionParams } from '@tweakpane/core';
import { Euler } from './Euler';
import { RotationInputController } from './RotationInputController';
import { createAxisEuler } from './createAxisEuler';
import { createDimensionConstraint } from './createDimensionConstraint';
import { createEulerAssembly } from './createEulerAssembly';
import { parseEuler } from './parseEuler';
import { parseEulerOrder } from './parseEulerOrder';
import { parseEulerUnit } from './parseEulerUnit';
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
      unit: p.optional.custom( parseEulerUnit ),
    } );

    return result ? {
      initialValue: parseEuler( exValue, result.order ?? 'XYZ', result.unit ?? 'rad' ),
      params: result,
    } : null;
  },

  binding: {
    reader( { params } ) {
      return ( exValue: unknown ): Euler => {
        return parseEuler( exValue, params.order ?? 'XYZ', params.unit ?? 'rad' );
      };
    },

    constraint( { params } ) {
      return new PointNdConstraint( {
        assembly: createEulerAssembly( params.order ?? 'XYZ', params.unit ?? 'rad' ),
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

    const unit = params.unit ?? 'rad';
    const digits = {
      rad: 2,
      deg: 0,
      turn: 2,
    }[ unit ];

    return new RotationInputController( document, {
      axes: [
        createAxisEuler( digits, constraint.components[ 0 ] ),
        createAxisEuler( digits, constraint.components[ 1 ] ),
        createAxisEuler( digits, constraint.components[ 2 ] ),
      ],
      assembly: createEulerAssembly( params.order ?? 'XYZ', unit ),
      rotationMode: 'euler',
      expanded: expanded ?? false,
      parser: parseNumber,
      pickerLayout: picker ?? 'popup',
      value,
      viewProps: viewProps,
    } );
  },
};
