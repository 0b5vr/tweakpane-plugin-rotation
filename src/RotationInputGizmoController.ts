import { Controller, PointerData, PointerHandler, PointerHandlerEvents, Value, ViewProps, createValue, getHorizontalStepKeys, getStepForKey, getVerticalStepKeys, isArrowKey } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
import { Rotation } from './Rotation';
import { RotationInputGizmoView } from './RotationInputGizmoView';
import { Vector3 } from './Vector3';
import { iikanjiEaseout } from './utils/iikanjiEaseout';
import { linearstep } from './utils/linearstep';
import { sanitizeAngle } from './utils/sanitizeAngle';
import type { RotationInputGizmoControllerConfig } from './RotationInputGizmoControllerConfig';

const INV_SQRT2 = 1.0 / Math.sqrt( 2.0 );
const VEC3_XP = new Vector3( 1.0, 0.0, 0.0 );
const VEC3_YP = new Vector3( 0.0, 1.0, 0.0 );
const VEC3_ZP = new Vector3( 0.0, 0.0, 1.0 );
const QUAT_IDENTITY = new Quaternion( 0.0, 0.0, 0.0, 1.0 );
const QUAT_TOP = new Quaternion( INV_SQRT2, 0.0, 0.0, INV_SQRT2 );
const QUAT_RIGHT = new Quaternion( 0.0, -INV_SQRT2, 0.0, INV_SQRT2 );
const QUAT_BOTTOM = new Quaternion( -INV_SQRT2, 0.0, 0.0, INV_SQRT2 );
const QUAT_LEFT = new Quaternion( 0.0, INV_SQRT2, 0.0, INV_SQRT2 );
const QUAT_BACK = new Quaternion( 0.0, 1.0, 0.0, 0.0 );

export class RotationInputGizmoController implements Controller<RotationInputGizmoView> {
  public readonly value: Value<Rotation>;
  public readonly view: RotationInputGizmoView;
  public readonly viewProps: ViewProps;
  private readonly mode_: Value<'free' | 'angle-x' | 'angle-y' | 'angle-z' | 'angle-r' | 'auto'>;
  private readonly ptHandler_: PointerHandler;
  private px_: number | null;
  private py_: number | null;
  private angleState_: {
    initialRotation: Rotation;
    initialAngle: number;
    axis: Vector3;
    reverseAngle: boolean;
  } | null;

  public constructor( doc: Document, config: RotationInputGizmoControllerConfig ) {
    this.onPadKeyDown_ = this.onPadKeyDown_.bind( this );
    this.onPointerDown_ = this.onPointerDown_.bind( this );
    this.onPointerMove_ = this.onPointerMove_.bind( this );
    this.onPointerUp_ = this.onPointerUp_.bind( this );

    this.value = config.value;
    this.viewProps = config.viewProps;

    this.mode_ = createValue( 'free' );

    this.view = new RotationInputGizmoView( doc, {
      value: this.value,
      mode: this.mode_,
      viewProps: this.viewProps,
      pickerLayout: config.pickerLayout,
    } );

    this.ptHandler_ = new PointerHandler( this.view.padElement );
    this.ptHandler_.emitter.on( 'down', this.onPointerDown_ );
    this.ptHandler_.emitter.on( 'move', this.onPointerMove_ );
    this.ptHandler_.emitter.on( 'up', this.onPointerUp_ );

    this.view.padElement.addEventListener( 'keydown', this.onPadKeyDown_ );

    const ptHandlerXArcB = new PointerHandler( this.view.xArcBElement as unknown as HTMLElement );
    ptHandlerXArcB.emitter.on( 'down', () => this.changeModeIfNotAuto_( 'angle-x' ) );
    ptHandlerXArcB.emitter.on( 'up', () => this.changeModeIfNotAuto_( 'free' ) );

    const ptHandlerXArcF = new PointerHandler( this.view.xArcFElement as unknown as HTMLElement );
    ptHandlerXArcF.emitter.on( 'down', () => this.changeModeIfNotAuto_( 'angle-x' ) );
    ptHandlerXArcF.emitter.on( 'up', () => this.changeModeIfNotAuto_( 'free' ) );

    const ptHandlerYArcB = new PointerHandler( this.view.yArcBElement as unknown as HTMLElement );
    ptHandlerYArcB.emitter.on( 'down', () => this.changeModeIfNotAuto_( 'angle-y' ) );
    ptHandlerYArcB.emitter.on( 'up', () => this.changeModeIfNotAuto_( 'free' ) );

    const ptHandlerYArcF = new PointerHandler( this.view.yArcFElement as unknown as HTMLElement );
    ptHandlerYArcF.emitter.on( 'down', () => this.changeModeIfNotAuto_( 'angle-y' ) );
    ptHandlerYArcF.emitter.on( 'up', () => this.changeModeIfNotAuto_( 'free' ) );

    const ptHandlerZArcB = new PointerHandler( this.view.zArcBElement as unknown as HTMLElement );
    ptHandlerZArcB.emitter.on( 'down', () => this.changeModeIfNotAuto_( 'angle-z' ) );
    ptHandlerZArcB.emitter.on( 'up', () => this.changeModeIfNotAuto_( 'free' ) );

    const ptHandlerZArcF = new PointerHandler( this.view.zArcFElement as unknown as HTMLElement );
    ptHandlerZArcF.emitter.on( 'down', () => this.changeModeIfNotAuto_( 'angle-z' ) );
    ptHandlerZArcF.emitter.on( 'up', () => this.changeModeIfNotAuto_( 'free' ) );

    const ptHandlerRArc = new PointerHandler( this.view.rArcElement as unknown as HTMLElement );
    ptHandlerRArc.emitter.on( 'down', () => this.changeModeIfNotAuto_( 'angle-r' ) );
    ptHandlerRArc.emitter.on( 'up', () => this.changeModeIfNotAuto_( 'free' ) );

    [
      { el: this.view.xLabel, q: QUAT_RIGHT },
      { el: this.view.yLabel, q: QUAT_TOP },
      { el: this.view.zLabel, q: QUAT_IDENTITY },
      { el: this.view.xnLabel, q: QUAT_LEFT },
      { el: this.view.ynLabel, q: QUAT_BOTTOM },
      { el: this.view.znLabel, q: QUAT_BACK },
    ].forEach( ( { el, q } ) => {
      const ptHandler = new PointerHandler( el as unknown as HTMLElement );
      ptHandler.emitter.on( 'down', () => this.autoRotate_( q ) );
    } );

    this.px_ = null;
    this.py_ = null;
    this.angleState_ = null;
  }

  private handlePointerEvent_( d: PointerData ): void {
    if ( !d.point ) {
      return;
    }

    const mode = this.mode_.rawValue;

    const x = d.point.x;
    const y = d.point.y;

    if ( mode === 'auto' ) {
      // do nothing
    } else if ( mode === 'free' ) {
      if ( this.px_ != null && this.py_ != null ) {
        const dx = x - this.px_;
        const dy = y - this.py_;
        const l = Math.sqrt( dx * dx + dy * dy );
        if ( l === 0.0 ) { return; }

        const axis = new Vector3( dy / l, dx / l, 0.0 );
        const quat = Quaternion.fromAxisAngle( axis, l / 68.0 );
        this.value.rawValue = this.value.rawValue.premultiply( quat );
      }

      this.px_ = x;
      this.py_ = y;
    } else if ( mode === 'angle-r' ) {
      const cx = d.bounds.width / 2.0;
      const cy = d.bounds.height / 2.0;
      const angle = Math.atan2( y - cy, x - cx );

      if ( this.angleState_ == null ) {
        const axis = new Vector3( 0.0, 0.0, 1.0 );

        this.angleState_ = {
          initialRotation: this.value.rawValue,
          initialAngle: angle,
          axis,
          reverseAngle: true,
        };
      } else {
        const { initialRotation, initialAngle, axis } = this.angleState_;

        const angleDiff = -sanitizeAngle( angle - initialAngle );
        const quat = Quaternion.fromAxisAngle( axis, angleDiff );
        this.value.rawValue = initialRotation.premultiply( quat );
      }
    } else {
      const cx = d.bounds.width / 2.0;
      const cy = d.bounds.height / 2.0;
      const angle = Math.atan2( y - cy, x - cx );

      if ( this.angleState_ == null ) {
        const axis = mode === 'angle-x' ? VEC3_XP :
          mode === 'angle-y' ? VEC3_YP :
          VEC3_ZP;

        const reverseAngle = axis.applyQuaternion( this.value.rawValue.quat ).z > 0.0;

        this.angleState_ = {
          initialRotation: this.value.rawValue,
          initialAngle: angle,
          axis,
          reverseAngle,
        };
      } else {
        const { initialRotation, initialAngle, axis, reverseAngle } = this.angleState_;

        let angleDiff = sanitizeAngle( angle - initialAngle );
        angleDiff = reverseAngle ? -angleDiff : angleDiff;
        const quat = Quaternion.fromAxisAngle( axis, angleDiff );
        this.value.rawValue = initialRotation.multiply( quat );
      }
    }
  }

  private onPointerDown_( ev: PointerHandlerEvents[ 'down' ] ): void {
    this.handlePointerEvent_( ev.data );
  }

  private onPointerMove_( ev: PointerHandlerEvents[ 'move' ] ): void {
    this.handlePointerEvent_( ev.data );
  }

  private onPointerUp_(): void {
    this.px_ = null;
    this.py_ = null;
    this.angleState_ = null;
  }

  private onPadKeyDown_( ev: KeyboardEvent ): void {
    if ( isArrowKey( ev.key ) ) {
      ev.preventDefault();
    }

    const x = getStepForKey( 1.0, getHorizontalStepKeys( ev ) );
    const y = getStepForKey( 1.0, getVerticalStepKeys( ev ) );

    if ( x !== 0 || y !== 0 ) {
      const axis = new Vector3( -y, x, 0.0 );
      const quat = Quaternion.fromAxisAngle( axis, Math.PI / 16.0 );
      this.value.rawValue = this.value.rawValue.premultiply( quat );
    }
  }

  private changeModeIfNotAuto_(
    mode: 'free' | 'angle-x' | 'angle-y' | 'angle-z' | 'angle-r',
  ): void {
    if ( this.mode_.rawValue !== 'auto' ) {
      this.mode_.rawValue = mode;
    }
  }

  private autoRotate_( to: Quaternion ): void {
    this.mode_.rawValue = 'auto';

    const from = this.value.rawValue;
    const beginTime = Date.now();

    const update = (): void => {
      const now = Date.now();
      const t = iikanjiEaseout( linearstep( 0.0, 300.0, now - beginTime ) );

      this.value.rawValue = from.slerp( to, t );

      if ( t === 1.0 ) {
        this.mode_.rawValue = 'free';
        return;
      }

      requestAnimationFrame( update );
    };
    requestAnimationFrame( update );
  }
}
