export const VERTEX_SHADER_SOURCE = `#version 300 es
in vec4 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;
void main() {
  gl_Position = a_position;
  v_texCoord = a_texCoord;
}`;

export const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;
precision highp sampler3D;

in vec2 v_texCoord;
out vec4 outColor;

uniform sampler2D u_image;
uniform sampler3D u_lut;
uniform float u_intensity;

void main() {
  vec4 color = texture(u_image, v_texCoord);
  vec3 lutColor = texture(u_lut, color.rgb).rgb;
  outColor = vec4(mix(color.rgb, lutColor, u_intensity), color.a);
}
`;

// Helper to compile shaders
export function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compilation failed: ' + info);
  }
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');

  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error('Program linking failed: ' + info);
  }
  return program;
}

// Simple .CUBE parser
// Returns { size, data: Uint8Array }
export function parseCubeLut(text: string) {
  const lines = text.split('\n');
  let size = 0;
  const data: number[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('LUT_3D_SIZE')) {
      const parts = line.split(/\s+/);
      size = parseInt(parts[1], 10);
      continue;
    }

    if (line.startsWith('TITLE')) continue;
    if (line.startsWith('DOMAIN_')) continue;

    // Check if it's data (3 numbers)
    const parts = line.split(/\s+/).filter(p => p !== '').map(parseFloat);
    if (parts.length === 3 && !isNaN(parts[0])) {
      // Convert 0.0-1.0 to 0-255, clamping to avoid wrapping
      data.push(
        Math.min(255, Math.max(0, Math.floor(parts[0] * 255))),
        Math.min(255, Math.max(0, Math.floor(parts[1] * 255))),
        Math.min(255, Math.max(0, Math.floor(parts[2] * 255)))
      );
    }
  }

  if (size === 0) {
    // try to infer size? Or fail.
    // Cube root of data.length / 3
    size = Math.round(Math.pow(data.length / 3, 1/3));
  }

  return { size, data: new Uint8Array(data) };
}

export function createLutTexture(gl: WebGL2RenderingContext, size: number, data: Uint8Array): WebGLTexture | null {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_3D, texture);

  gl.texImage3D(
    gl.TEXTURE_3D,
    0,
    gl.RGB, // Standard internal format
    size,
    size,
    size,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE, // Standard data type
    data
  );

  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

  return texture;
}
