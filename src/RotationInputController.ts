import { Controller, Foldable, PointNdTextController, PopupController, Value, ViewProps, bindFoldable, connectValues, findNextTarget, forceCast, supportsTouch } from '@tweakpane/core';
import { RotationInputGizmoController } from './RotationInputGizmoController';
import { RotationInputSwatchController } from './RotationInputSwatchController';
import { RotationInputView } from './RotationInputView';
import type { Rotation } from './Rotation';
import type { RotationInputControllerConfig } from './RotationInputControllerConfig';

export class RotationInputController implements Controller<RotationInputView> {
  public readonly value: Value<Rotation>;
  public readonly view: RotationInputView;
  public readonly viewProps: ViewProps;
  private readonly swatchC_: RotationInputSwatchController;
  private readonly textC_: PointNdTextController<Rotation>;
  private readonly popC_: PopupController | null;
  private readonly gizmoC_: RotationInputGizmoController;
  private readonly foldable_: Foldable;

  public constructor( doc: Document, config: RotationInputControllerConfig ) {
    this.onButtonBlur_ = this.onButtonBlur_.bind( this );
    this.onButtonClick_ = this.onButtonClick_.bind( this );
    this.onPopupChildBlur_ = this.onPopupChildBlur_.bind( this );
    this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind( this );

    this.value = config.value;
    this.viewProps = config.viewProps;

    this.foldable_ = Foldable.create( config.expanded );

    this.swatchC_ = new RotationInputSwatchController( doc, {
      value: this.value,
      viewProps: this.viewProps,
    } );
    const buttonElem = this.swatchC_.view.buttonElement;
    buttonElem.addEventListener( 'blur', this.onButtonBlur_ );
    buttonElem.addEventListener( 'click', this.onButtonClick_ );

    this.textC_ = new PointNdTextController( doc, {
      assembly: config.assembly as any, // TODO: resolve type puzzle
      axes: config.axes,
      parser: config.parser,
      value: this.value,
      viewProps: this.viewProps,
    } );

    this.view = new RotationInputView( doc, {
      rotationMode: config.rotationMode,
      foldable: this.foldable_,
      pickerLayout: config.pickerLayout,
    } );
    this.view.swatchElement.appendChild( this.swatchC_.view.element );
    this.view.textElement.appendChild( this.textC_.view.element );

    this.popC_ =
      config.pickerLayout === 'popup'
        ? new PopupController( doc, {
          viewProps: this.viewProps,
        } )
        : null;

    const gizmoC = new RotationInputGizmoController( doc, {
      value: this.value,
      viewProps: this.viewProps,
      pickerLayout: config.pickerLayout,
    } );
    gizmoC.view.allFocusableElements.forEach( ( elem ) => {
      elem.addEventListener( 'blur', this.onPopupChildBlur_ );
      elem.addEventListener( 'keydown', this.onPopupChildKeydown_ );
    } );
    this.gizmoC_ = gizmoC;

    if ( this.popC_ ) {
      this.view.element.appendChild( this.popC_.view.element );
      this.popC_.view.element.appendChild( gizmoC.view.element );

      connectValues( {
        primary: this.foldable_.value( 'expanded' ),
        secondary: this.popC_.shows,
        forward: ( p ) => p.rawValue,
        backward: ( _, s ) => s.rawValue,
      } );
    } else if ( this.view.pickerElement ) {
      this.view.pickerElement.appendChild( this.gizmoC_.view.element );

      bindFoldable( this.foldable_, this.view.pickerElement );
    }
  }

  private onButtonBlur_( e: FocusEvent ): void {
    if ( !this.popC_ ) {
      return;
    }

    const elem = this.view.element;
    const nextTarget: HTMLElement | null = forceCast( e.relatedTarget );
    if ( !nextTarget || !elem.contains( nextTarget ) ) {
      this.popC_.shows.rawValue = false;
    }
  }

  private onButtonClick_(): void {
    this.foldable_.set( 'expanded', !this.foldable_.get( 'expanded' ) );
    if ( this.foldable_.get( 'expanded' ) ) {
      this.gizmoC_.view.allFocusableElements[ 0 ].focus();
    }
  }

  private onPopupChildBlur_( ev: FocusEvent ): void {
    if ( !this.popC_ ) {
      return;
    }

    const elem = this.popC_.view.element;
    const nextTarget = findNextTarget( ev );
    if ( nextTarget && elem.contains( nextTarget ) ) {
      // Next target is in the picker
      return;
    }
    if (
      nextTarget &&
      nextTarget === this.swatchC_.view.buttonElement &&
      !supportsTouch( elem.ownerDocument )
    ) {
      // Next target is the trigger button
      return;
    }

    this.popC_.shows.rawValue = false;
  }

  private onPopupChildKeydown_( ev: KeyboardEvent ): void {
    if ( this.popC_ ) {
      if ( ev.key === 'Escape' ) {
        this.popC_.shows.rawValue = false;
      }
    } else if ( this.view.pickerElement ) {
      if ( ev.key === 'Escape' ) {
        this.swatchC_.view.buttonElement.focus();
      }
    }
  }
}
