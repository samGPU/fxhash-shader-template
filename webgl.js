export default class Renderer {

    // Vertex shader code
    #vertexShaderSource = `#version 300 es
        in vec4 a_position;

        void main() {
            gl_Position = a_position;
        }
    `;

    // Fragment shader code, only edit for custom use cases
    #fragmentShaderSource = `#version 300 es
        precision highp float;

        uniform vec2 iResolution;
        uniform vec2 iMouse;
        uniform float iTime;
        // insert-variables

        out vec4 outColor;

        //insert-here

        void main() {
            mainImage(outColor, gl_FragCoord.xy);
        }
    `;

    // fallback mainImage code if none is provided / sample code
    #mainImageCode = `
        void mainImage( out vec4 fragColor, in vec2 fragCoord )
        {
            vec2 uv = fragCoord.xy / iResolution.xy;
            fragColor = vec4(uv,0.5+0.5*sin(iTime), iMouse.x);
        }
    `

    constructor(mainImageCode = '') {
        // Create the canvas and add it to the page
        const canvas = document.createElement("canvas");
        canvas.classList.add("webgl");
        document.body.appendChild(canvas);

        // Add the users mainImageCode
        if(mainImageCode !== '') {
            this.#mainImageCode = mainImageCode;
        }

        this.buildShader(canvas);

        // Set a random seed and a cental mouse position to begin
        this.seed = $fx.rand();
        this.mouse = { x: 0.5, y: 0.5 };

        // Add the mousemove event listener
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX / window.innerWidth;
            this.mouse.y = e.clientY / window.innerHeight;
        });

        this.animate();
    }

    buildShader(canvas) {
        // Create the WebGL2 context and programs
        // iResolution, iMouse, iTime are the default uniforms
        this.gl = canvas.getContext("webgl2");
        if (!this.gl) {
            throw new Error("WebGL2 not supported");
        }
        this.addVariablesToShader();
        this.program = this.createProgram(this.gl);
        const positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.resolutionLocation = this.gl.getUniformLocation(this.program, "iResolution");
        this.mouseLocation = this.gl.getUniformLocation(this.program, "iMouse");
        this.timeLocation = this.gl.getUniformLocation(this.program, "iTime");
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(
            positionAttributeLocation,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        )
    }

    // Main drawing loop
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);

        this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform1f(this.timeLocation, performance.now() / 1000 + this.seed);
        this.gl.uniform2f(this.mouseLocation, this.mouse.x, this.mouse.y);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }   

    // Create a shader instance
    createShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    // Create the shader program
    createProgram(gl) {
        // insert the mainImage code into the fragment shader
        const fragmentCode = this.#fragmentShaderSource.replace("//insert-here", this.#mainImageCode);

        console.log(fragmentCode);

        const vertexShader = this.createShader(gl, this.#vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = this.createShader(gl, fragmentCode, gl.FRAGMENT_SHADER);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!0 !== gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            throw new Error("Could not compile WebGL program. \n\n" + info);
        }
        return program;
    }

    /**
     * Assign the parameters set by fxhash to the shader
     * 
     * Supported types:
     *  - number        (float)
     *  - boolean       (bool)
     *  - color         (Object, extract rgba values and store as vec4)
     *  - bigint        (bigint)
     * 
     * Unsupported types:
     *  - string        no way to represent it in webgl as standard
     *                  +   You could use an algorithm to convert it to a number 
     *                      following some devised ruleset if you really want a 
     *                      string parameter
     *  - select        its just a string with extra steps so same applies
     */
    addVariablesToShader() {
        const variables = $fx.getParams();
        // Loop through the variables and assign them to the shader
        for (const key in variables) {
            // Get the value for the key
            const value = variables[key];

            console.log(value, typeof value, Number(value));
            
            // Determine the type of the variable
            // Based on the type, assign the variable to the shader by replacing at the comment
            if (typeof value === 'number') {

                const stringToAdd = `float fx_${key} = ${value};\n// insert-variables`;

                this.#fragmentShaderSource = 
                    this.#fragmentShaderSource.replace("// insert-variables", stringToAdd);
            } else if (typeof value === 'boolean') {

                const stringToAdd = `bool fx_${key} = ${value};\n// insert-variables`;

                this.#fragmentShaderSource = 
                    this.#fragmentShaderSource.replace("// insert-variables", stringToAdd);
            } else if (typeof value === 'object') {
                const { r, g, b, a } = value.obj.rgba;

                console.log(value.obj.rgba);
                console.log(`${r.toFixed(1)}, ${parseFloat(g)}, ${parseFloat(b)}, ${parseFloat(a)}`);

                const stringToAdd = `vec4 fx_${key} = vec4(${r.toFixed(1)}, ${g.toFixed(1)}, ${b.toFixed(1)}, ${a.toFixed(1)});\n// insert-variables`;

                this.#fragmentShaderSource = 
                    this.#fragmentShaderSource.replace("// insert-variables", stringToAdd);
            } else if (typeof value === 'bigint') {
                let bigint = 0;
                // Ensure the bigint is within the range of a glsl integer
                if(value > 2147483647) {
                    bigint = 2147483647;
                } else if(value < -2147483648) {
                    bigint = -2147483648;
                } else {
                    bigint = Number(value);
                }

                const stringToAdd = `int fx_${key} = ${bigint};\n// insert-variables`;

                this.#fragmentShaderSource = 
                    this.#fragmentShaderSource.replace("// insert-variables", stringToAdd);
            } else {
                // Unsupported type
                console.warn(`fxParameter type not supported: ${key} : ${typeof value}`);
            }
        }
    }
}