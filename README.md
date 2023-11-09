# `@0b5vr/tweakpane-plugin-rotation`

[![npm](https://img.shields.io/npm/v/@0b5vr/tweakpane-plugin-rotation?logo=npm&style=flat-square)](https://www.npmjs.com/package/@0b5vr/tweakpane-plugin-rotation)

Rotation input plugin for Tweakpane

![@0b5vr/tweakpane-plugin-rotation, Rotation input plugin for tweakpane. A working screenshot of the plugin on the right](https://github.com/0b5vr/tweakpane-plugin-rotation/raw/dev/readme-images/rotation.png)

[Sandbox](https://0b5vr.github.io/tweakpane-plugin-rotation)

```html
<script type="module">
  import * as Tweakpane from 'https://unpkg.com/tweakpane@4.0.1/dist/tweakpane.js';
  import * as TweakpaneRotationInputPlugin from './tweakpane-plugin-rotation.js';

  const pane = new Tweakpane.Pane();

  pane.registerPlugin(TweakpaneRotationInputPlugin);

  const params = {
    euler: { x: 0.0, y: 0.0, z: 0.0 },
    quat: { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
  };

  // euler
  const guiEuler = pane.addBinding(params, 'euler', {
    view: 'rotation',
    rotationMode: 'euler',
    order: 'XYZ', // Extrinsic rotation order. optional, 'XYZ' by default
    unit: 'deg', // or 'rad' or 'turn'. optional, 'rad' by default
  });

  // quaternion
  const guiQuat = pane.addBinding(params, 'quat', {
    view: 'rotation',
    rotationMode: 'quaternion', // optional, 'quaternion' by default
    picker: 'inline', // or 'popup'. optional, 'popup' by default
    expanded: true, // optional, false by default
  });

  guiEuler.on('change', ({ value }) => {
    console.log(value); // do something
  });
</script>
```
