# WebGL2 Generative Art Template

I built this application using the fxhash/cli to create a template that allows an artist to more easily create generative art projects using shader code as found on shadertoy.

## Usage

### Shader code

Edit the `shaderCode` in `index.js` with the shader code typically found on [shadertoy](https://www.shadertoy.com/).

The final pixel colour data should be outputted via a function named mainImage, as this is what will be called by the main fragmentShader.

Three default uniforms are included:
1. vec2 iResolution : The current resolution of the canvas, x for width and y for height.
2. float iTime : The current runtime of the shader.
3. vec2 iMouse : The current mouse position, x and y. 0,0 bottom left to 1,1 top right.

This example code will create a whole screen gradient that animates over time using iTime and reacts to the users horizontal mouse position.

```glsl
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    fragColor = vec4(uv,0.5+0.5*sin(iTime), iMouse.x);
}
```

### fxParameters

fxHash parameters provide a unique way for a user to interact with the generative art minting process. A full specification for these can be found [here](https://docs.fxhash.xyz/parameter-definition-specifications).

Parameters that are of the type `number`, `boolean`, `color`, or `bigint`, will be added to the shader code as variables.
This means that they can be used in shader code and accessed using the naming convention fx_ followed by the parameter id. For example, fx_color_id for the example color parameter.

This example code will fill the screen with a color chosen by the user in the fxParameters interface, and set the alpha via a boolean value.

```glsl
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    fragColor = vec4(fx_color_id.rgb, fx_boolean_id ? 1.0 : 0.0);
}
```

## Installation

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/samgpu/fxhash-shader-template.git
    ```
2. Navigate to the project directory:
    ```sh
    cd fxhash-shader-template
    ```
3. Start the fxhash cli development
    ```sh
    npx fxhash dev
    ```
4. Build the files for deployment
    ```sh
    npx fxhash build
    ```

Find more about the fxhash/cli [here](https://www.npmjs.com/package/@fxhash/cli).

You are now ready to start creating your generative art project.