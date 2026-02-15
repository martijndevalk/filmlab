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
  grainAmount: number;
  halationAmount: number;
  showOriginal: boolean;
}

export function useLutFilter({
  canvasRef,
  image,
  lutUrl,
  intensity,
  grainAmount,
  halationAmount,
  showOriginal
}: UseLutFilterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lutIdentifier, setLutIdentifier] = useState(0); // Used to force re-render when LUT changes
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const lutTextureRef = useRef<WebGLTexture | null>(null);
  const imageTextureRef = useRef<WebGLTexture | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const texCoordBufferRef = useRef<WebGLBuffer | null>(null);

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

    try {
      programRef.current = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);

      // Initialize Quad Buffers
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  1, -1, -1,  1,
        -1,  1,  1, -1,  1,  1,
      ]), gl.STATIC_DRAW);
      positionBufferRef.current = positionBuffer;

      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 1,  1, 1,  0, 0, // Map Top-Left of image to Top-Left of GL quad
        0, 0,  1, 1,  1, 0,
      ]), gl.STATIC_DRAW);
      texCoordBufferRef.current = texCoordBuffer;

    } catch (e) {
      console.error('Failed to initialize WebGL program:', e);
    }

    return () => {
      if (glRef.current) {
        if (positionBufferRef.current) glRef.current.deleteBuffer(positionBufferRef.current);
        if (texCoordBufferRef.current) glRef.current.deleteBuffer(texCoordBufferRef.current);
      }
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

        // Force re-render
        setLutIdentifier(prev => prev + 1);

      } catch (err) {
        console.error('Failed to load LUT:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    loadLut();
  }, [lutUrl, glRef.current]);

  // Render Loop
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !programRef.current || !canvasRef.current || !image) return;

    const render = (time: number) => {
      if (!canvasRef.current || !gl || !image) return;

      // 1. Resize canvas to match image, but cap it for preview performance on mobile
      const MAX_PREVIEW_SIZE = 2048;
      let targetWidth = image.width;
      let targetHeight = image.height;

      if (targetWidth > MAX_PREVIEW_SIZE || targetHeight > MAX_PREVIEW_SIZE) {
        const ratio = Math.min(MAX_PREVIEW_SIZE / targetWidth, MAX_PREVIEW_SIZE / targetHeight);
        targetWidth = Math.floor(targetWidth * ratio);
        targetHeight = Math.floor(targetHeight * ratio);
      }

      if (canvasRef.current.width !== targetWidth || canvasRef.current.height !== targetHeight) {
        canvasRef.current.width = targetWidth;
        canvasRef.current.height = targetHeight;
        gl.viewport(0, 0, targetWidth, targetHeight);
      }

      gl.useProgram(programRef.current!);

      // 2. Upload Image Texture (Proper lifecycle)
      if (!imageTextureRef.current) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
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

      // New Uniforms
      gl.uniform1f(gl.getUniformLocation(programRef.current!, 'u_grainAmount'), grainAmount / 100);
      gl.uniform1f(gl.getUniformLocation(programRef.current!, 'u_halationAmount'), halationAmount / 100);
      gl.uniform1i(gl.getUniformLocation(programRef.current!, 'u_showOriginal'), showOriginal ? 1 : 0);
      gl.uniform1f(gl.getUniformLocation(programRef.current!, 'u_time'), time * 0.001);

      // Draw Quad
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
      const a_position = gl.getAttribLocation(programRef.current!, 'a_position');
      gl.enableVertexAttribArray(a_position);
      gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferRef.current);
      const a_texCoord = gl.getAttribLocation(programRef.current!, 'a_texCoord');
      gl.enableVertexAttribArray(a_texCoord);
      gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const handle = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(handle);
      // Ensure texture is cleaned up when effect re-runs
      if (glRef.current && imageTextureRef.current) {
        glRef.current.deleteTexture(imageTextureRef.current);
        imageTextureRef.current = null;
      }
    };

  }, [image, intensity, lutUrl, lutIdentifier, grainAmount, halationAmount, showOriginal]);

  return { isProcessing };
}
