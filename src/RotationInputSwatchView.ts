import { ClassName, Value, View } from '@tweakpane/core';
import { Rotation } from './Rotation';
import type { RotationInputSwatchViewConfig } from './RotationInputSwatchViewConfig';

const className = ClassName( 'rotationswatch' );

export class RotationInputSwatchView implements View {
  public readonly element: HTMLElement;
  public readonly value: Value<Rotation>;
  public readonly buttonElement: HTMLButtonElement;
  private swatchElem_: HTMLDivElement;

  public constructor( doc: Document, config: RotationInputSwatchViewConfig ) {
    this.onValueChange_ = this.onValueChange_.bind( this );

    config.value.emitter.on( 'change', this.onValueChange_ );
    this.value = config.value;

    this.element = doc.createElement( 'div' );
    this.element.classList.add( className() );
    config.viewProps.bindClassModifiers( this.element );

    const swatchElem = doc.createElement( 'div' );
    swatchElem.classList.add( className( 'sw' ) );
    this.element.appendChild( swatchElem );
    this.swatchElem_ = swatchElem;

    const buttonElem = doc.createElement( 'button' );
    buttonElem.classList.add( className( 'b' ) );
    config.viewProps.bindDisabled( buttonElem );
    this.element.appendChild( buttonElem );
    this.buttonElement = buttonElem;

    this.update_();
  }

  private update_(): void {
    const value = this.value.rawValue;
  }

  private onValueChange_(): void {
    this.update_();
  }
}
