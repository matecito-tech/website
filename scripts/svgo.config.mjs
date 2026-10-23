// Configuración de SVGO para las ilustraciones del hero (bunx svgo --config scripts/svgo.config.mjs -i <svg> -o <svg>).
// Conserva ids, clases, estilos y elementos que arrancan invisibles: las animaciones dependen de ellos.
export default {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    { name: 'preset-default', params: { overrides: {
      cleanupIds: false,          // #layer-char y los ids del clip se usan
      inlineStyles: false,        // el <style> de animaciones queda intacto
      minifyStyles: false,
      removeUnknownsAndDefaults: { keepRoleAttr: true, keepAriaAttrs: true },
      mergePaths: false,          // la clase .humo va en un path propio
      convertShapeToPath: false,  // los .puf son <circle>
      removeUselessStrokeAndFill: false, // el color de .puf viene del CSS
      removeHiddenElems: false,   // .puf/.brillo arrancan invisibles y se animan
    } } },
  ],
};
