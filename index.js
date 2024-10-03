import Renderer from './webgl'

// Give the body a class to apply styling
document.body.classList.add("fx")

/**
 * This is the main code for the shader
 * out : vec4 fragColor : this is the colour of the pixel
 * in : vec2 fragCoord : this is the coordinate of the pixel
 */
const shaderCode = `
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        fragColor = vec4(fx_color_id.rgb, fx_boolean_id ? 1.0 : 0.0);
    }
`

// Define the parameters for your shader if you are using them
$fx.params([
  {
    id: "number_id",
    name: "A number/float64",
    type: "number",
    default: Math.PI,
    options: {
      min: 1,
      max: 10,
      step: 0.0001,
    },
  },
  {
    id: "bigint_id",
    name: "A bigint",
    type: "bigint",
    default: BigInt(Number.MAX_SAFE_INTEGER * 2),
    options: {
      min: Number.MIN_SAFE_INTEGER * 4,
      max: Number.MAX_SAFE_INTEGER * 4,
      step: 1,
    },
  },
  {
    id: "color_id",
    name: "A color",
    type: "color",
    default: "ff0000",
  },
  {
    id: "boolean_id",
    name: "A boolean",
    type: "boolean",
    default: true,
  },
])

// Create a new renderer with the shader code
// The shader code is inserted into the fragment shader
// The renderer is boilerplate, you can focus on the shader code
const renderer = new Renderer(shaderCode)

// Tell the shader to update the parameters when they are changed
$fx.on(
  "params:update",
  // we do nothing when the event is recieved
  () => {},
  () => {
    renderer.addVariablesToShader();
    renderer.buildShader();
  }
)

// Define the features for your project
$fx.features({
  "A random feature": Math.floor($fx.rand() * 10),
  "A random boolean": $fx.rand() > 0.5,
  "A random string": ["A", "B", "C", "D"].at(Math.floor($fx.rand() * 4)),
  "Feature from params, its a number": $fx.getParam("number_id"),
})
