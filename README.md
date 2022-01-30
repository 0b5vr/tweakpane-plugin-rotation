# `@0b5vr/tweakpane-plugin-rotation`

[![npm](https://img.shields.io/npm/v/@0b5vr/tweakpane-plugin-rotation?logo=npm&style=flat-square)](https://www.npmjs.com/package/@0b5vr/tweakpane-plugin-rotation)

Rotation input plugin for Tweakpane

![rotation](https://github.com/0b5vr/tweakpane-plugin-rotation/raw/dev/readme-images/rotation.png)

[Sandbox](https://0b5vr.github.io/tweakpane-plugin-rotation)

```html
<script src="https://unpkg.com/tweakpane@3.0.5/dist/tweakpane.js"></script>
<script src="./tweakpane-plugin-rotation.js"></script>
<script>
  const pane = new Tweakpane.Pane();

  pane.registerPlugin( TweakpaneRotationInputPlugin );

  const params = {
    rotation: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
  };

  const rotation = pane.addInput( params, 'rotation', {
    view: 'rotation',
    label: 'rotation',
  } );
</script>
```
