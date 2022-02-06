import { BindingTarget, InputBindingPlugin, ParamsParsers, PointNdConstraint, TpError, parseNumber, parseParams, parsePickerLayout, parsePointDimensionParams } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
import { QuaternionAssembly } from './QuaternionAssembly';
import { RotationInputController } from './RotationInputController';
import { createAxis } from './createAxis';
import { createDimensionConstraint } from './createDimensionConstraint';
import { parseQuaternion } from './parseQuaternion';
import type { RotationInputPluginQuaternionParams } from './RotationInputPluginQuaternionParams';

export const RotationInputPluginQuaternion: InputBindingPlugin<
Quaternion,
Quaternion,
RotationInputPluginQuaternionParams
> = {
  id: 'rotation',
  type: 'input',
  css: '__css__',

  accept( exValue: unknown, params: Record<string, unknown> ) {
    // Parse parameters object
    const p = ParamsParsers;
    const result = parseParams<RotationInputPluginQuaternionParams>( params, {
      view: p.required.constant( 'rotation' ),
      label: p.optional.string,
      picker: p.optional.custom( parsePickerLayout ),
      expanded: p.optional.boolean,
      rotationMode: p.optional.constant( 'quaternion' ),
      x: p.optional.custom( parsePointDimensionParams ),
      y: p.optional.custom( parsePointDimensionParams ),
      z: p.optional.custom( parsePointDimensionParams ),
      w: p.optional.custom( parsePointDimensionParams ),
    } );

    return result ? {
      initialValue: parseQuaternion( exValue ),
      params: result,
    } : null;
  },

  binding: {
    reader( _args ) {
      return ( exValue: unknown ): Quaternion => {
        return parseQuaternion( exValue );
      };
    },

    constraint( { params } ) {
      return new PointNdConstraint( {
        assembly: QuaternionAssembly,
        components: [
          createDimensionConstraint( 'x' in params ? params.x : undefined ),
          createDimensionConstraint( 'y' in params ? params.y : undefined ),
          createDimensionConstraint( 'z' in params ? params.z : undefined ),
          createDimensionConstraint( 'w' in params ? params.w : undefined ),
        ]
      } );
    },

    writer( _args ) {
      return ( target: BindingTarget, inValue: Quaternion ) => {
        target.writeProperty( 'x', inValue.x );
        target.writeProperty( 'y', inValue.y );
        target.writeProperty( 'z', inValue.z );
        target.writeProperty( 'w', inValue.w );
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
        createAxis( value.rawValue.w, constraint.components[ 3 ] ),
      ],
      assembly: QuaternionAssembly,
      rotationMode: 'quaternion',
      expanded: expanded ?? false,
      parser: parseNumber,
      pickerLayout: picker ?? 'popup',
      value,
      viewProps: viewProps,
    } );
  },
};
