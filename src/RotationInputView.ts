import { ClassName, View, bindValueMap, valueToClassName } from '@tweakpane/core';
import type { RotationInputViewConfig } from './RotationInputViewConfig';

const className = ClassName( 'rotation' );

export class RotationInputView implements View {
  public readonly element: HTMLElement;
  public readonly swatchElement: HTMLElement;
  public readonly textElement: HTMLElement;
  public readonly pickerElement: HTMLElement | null;

  public constructor( doc: Document, config: RotationInputViewConfig ) {
    this.element = doc.createElement( 'div' );
    this.element.classList.add( className() );
    config.foldable.bindExpandedClass(
      this.element,
      className( undefined, 'expanded' ),
    );
    bindValueMap(
      config.foldable,
      'completed',
      valueToClassName( this.element, className( undefined, 'cpl' ) ),
    );

    const headElem = doc.createElement( 'div' );
    headElem.classList.add( className( 'h' ) );
    this.element.appendChild( headElem );

    const swatchElem = doc.createElement( 'div' );
    swatchElem.classList.add( className( 's' ) );
    headElem.appendChild( swatchElem );
    this.swatchElement = swatchElem;

    const textElem = doc.createElement( 'div' );
    textElem.classList.add( className( 't' ) );
    headElem.appendChild( textElem );
    this.textElement = textElem;

    if ( config.pickerLayout === 'inline' ) {
      const pickerElem = doc.createElement( 'div' );
      pickerElem.classList.add( className( 'g' ) );
      this.element.appendChild( pickerElem );
      this.pickerElement = pickerElem;
    } else {
      this.pickerElement = null;
    }
  }
}
