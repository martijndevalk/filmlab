import { useEffect, useRef, useState } from 'react';
import {
  createProgram,
  createLutTexture,
  parseCubeLut,
  VERTEX_SHADER_SOURCE,
  FRAGMENT_SHADER_SOURCE
} from '../utils/gl-utils';

interface UseLutFilterProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  lutUrl: string | null;
  intensity: number;
}

export function useLutFilter({ canvasRef, image, lutUrl, intensity }: UseLutFilterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const lutTextureRef = useRef<WebGLTexture | null>(null);
  const imageTextureRef = useRef<WebGLTexture | null>(null);

  // Initialize WebGL
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });

    if (!gl) {
      console.error('WebGL 2 not supported');
      return;
    }

    glRef.current = gl;

    // Compile shader with dynamic replacement if needed (e.g. for dynamic size, but we can stick to uniforms)
    // We need to handle the "size" variable in the fragment shader.
    // Let's modify the source string before compiling.
    // Actually, texture() with sampler3D uses normalized coordinates (0..1), so strict size isn't needed for lookup
    // IF we trust linear interpolation.
    // But precise edge handling often requires knowing texel size (0.5/size).
    // For this simple version, standard texture lookup is fine.

    try {
      programRef.current = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    } catch (e) {
      console.error(e);
    }

    return () => {
      // Cleanup GL resources if needed
      // gl.deleteProgram...
    };
  }, [canvasRef]);

  // Load LUT
  useEffect(() => {
    if (!lutUrl || !glRef.current) return;

    const loadLut = async () => {
      setIsProcessing(true);
      try {
        const response = await fetch(lutUrl);
        const text = await response.text();
        const { size, data } = parseCubeLut(text);

        const gl = glRef.current!;

        // Cleanup old texture
        if (lutTextureRef.current) gl.deleteTexture(lutTextureRef.current);

        lutTextureRef.current = createLutTexture(gl, size, data);

        // Re-compile shader if size changed significantly?
        // Or just update uniform if we used one.
        // For now, assuming 33 size or similar is handled by Linear filtering.

      } catch (err) {
        console.error('Failed to load LUT:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    loadLut();
  }, [lutUrl]);

  // Render Loop
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !programRef.current || !canvasRef.current || !image) return; // Wait for image

    const render = () => {
      // Resize canvas to match image
      if (canvasRef.current!.width !== image.width || canvasRef.current!.height !== image.height) {
        canvasRef.current!.width = image.width;
        canvasRef.current!.height = image.height;
        gl.viewport(0, 0, image.width, image.height);
      }

      gl.useProgram(programRef.current);

      // Upload Image Texture
      // In production, only upload when image changes.
      if (!imageTextureRef.current) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        imageTextureRef.current = tex;
      }

      // Bind Textures
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTextureRef.current);
      gl.uniform1i(gl.getUniformLocation(programRef.current!, 'u_image'), 0);

      if (lutTextureRef.current) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, lutTextureRef.current);
        gl.uniform1i(gl.getUniformLocation(programRef.current!, 'u_lut'), 1);
        gl.uniform1f(gl.getUniformLocation(programRef.current!, 'u_intensity'), intensity / 100);
      } else {
         gl.uniform1f(gl.getUniformLocation(programRef.current!, 'u_intensity'), 0.0);
      }

      // Draw Quad
      // We need a buffer for the full screen quad
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]), gl.STATIC_DRAW);

      const a_position = gl.getAttribLocation(programRef.current!, 'a_position');
      gl.enableVertexAttribArray(a_position);
      gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

      // TexCoords (flipped Y?)
      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 1,
        1, 0,
      ]), gl.STATIC_DRAW);

      const a_texCoord = gl.getAttribLocation(programRef.current!, 'a_texCoord');
      gl.enableVertexAttribArray(a_texCoord);
      gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    requestAnimationFrame(render);

  }, [image, intensity, lutUrl]); // Re-render when these change

  return { isProcessing };
}
