import { Controller, PointerData, PointerHandler, PointerHandlerEvents, Value, ViewProps, createValue, isArrowKey } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
import { RotationInputGizmoView } from './RotationInputGizmoView';
import { Vector3 } from './Vector3';
import { sanitizeAngle } from './utils/sanitizeAngle';
import type { RotationInputGizmoControllerConfig } from './RotationInputGizmoControllerConfig';

const VEC3_XP = new Vector3( 1.0, 0.0, 0.0 );
const VEC3_YP = new Vector3( 0.0, 1.0, 0.0 );
const VEC3_ZP = new Vector3( 0.0, 0.0, 1.0 );

export class RotationInputGizmoController implements Controller<RotationInputGizmoView> {
  public readonly value: Value<Quaternion>;
  public readonly view: RotationInputGizmoView;
  public readonly viewProps: ViewProps;
  private readonly mode_: Value<'free' | 'x' | 'y' | 'z'>;
  private readonly ptHandler_: PointerHandler;
  private px_: number | null;
  private py_: number | null;
  private angleState_: {
    initialRotation: Quaternion;
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
    ptHandlerXArcB.emitter.on( 'down', () => this.mode_.rawValue = 'x' );
    ptHandlerXArcB.emitter.on( 'up', () => this.mode_.rawValue = 'free' );

    const ptHandlerXArcF = new PointerHandler( this.view.xArcFElement as unknown as HTMLElement );
    ptHandlerXArcF.emitter.on( 'down', () => this.mode_.rawValue = 'x' );
    ptHandlerXArcF.emitter.on( 'up', () => this.mode_.rawValue = 'free' );

    const ptHandlerYArcB = new PointerHandler( this.view.yArcBElement as unknown as HTMLElement );
    ptHandlerYArcB.emitter.on( 'down', () => this.mode_.rawValue = 'y' );
    ptHandlerYArcB.emitter.on( 'up', () => this.mode_.rawValue = 'free' );

    const ptHandlerYArcF = new PointerHandler( this.view.yArcFElement as unknown as HTMLElement );
    ptHandlerYArcF.emitter.on( 'down', () => this.mode_.rawValue = 'y' );
    ptHandlerYArcF.emitter.on( 'up', () => this.mode_.rawValue = 'free' );

    const ptHandlerZArcB = new PointerHandler( this.view.zArcBElement as unknown as HTMLElement );
    ptHandlerZArcB.emitter.on( 'down', () => this.mode_.rawValue = 'z' );
    ptHandlerZArcB.emitter.on( 'up', () => this.mode_.rawValue = 'free' );

    const ptHandlerZArcF = new PointerHandler( this.view.zArcFElement as unknown as HTMLElement );
    ptHandlerZArcF.emitter.on( 'down', () => this.mode_.rawValue = 'z' );
    ptHandlerZArcF.emitter.on( 'up', () => this.mode_.rawValue = 'free' );

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

    if ( mode === 'free' ) {
      if ( this.px_ != null && this.py_ != null ) {
        const dx = x - this.px_;
        const dy = y - this.py_;
        const l = Math.sqrt( dx * dx + dy * dy );
        if ( l === 0.0 ) { return; }

        const axis = new Vector3( dy / l, dx / l, 0.0 );
        const quat = Quaternion.fromAxisAngle( axis, l / 68.0 );
        this.value.rawValue = quat.multiply( this.value.rawValue );
      }

      this.px_ = x;
      this.py_ = y;
    } else {
      const cx = d.bounds.width / 2.0;
      const cy = d.bounds.height / 2.0;
      const angle = Math.atan2( y - cy, x - cx );

      if ( this.angleState_ == null ) {
        const axis = mode === 'x' ? VEC3_XP :
          mode === 'y' ? VEC3_YP :
          VEC3_ZP;

        const reverseAngle = axis.applyQuaternion( this.value.rawValue ).z > 0.0;

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

    // this.value.rawValue = new Point2d(
    //   this.value.rawValue.x +
    //     getStepForKey( this.baseSteps_[ 0 ], getHorizontalStepKeys( ev ) ),
    //   this.value.rawValue.y +
    //     getStepForKey( this.baseSteps_[ 1 ], getVerticalStepKeys( ev ) ) *
    //       ( this.invertsY_ ? 1 : -1 ),
    // );
  }
}
