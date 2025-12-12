import { useRef, useEffect, useState } from 'react';
import { COLORS, BRUSH_SIZES, DRAWING_TOOLS } from '../shared/constants.js';
import './Canvas.css';

function Canvas({ isDrawer, onDraw, onClear, onUndo, drawingHistory, currentSegments = [] }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState(BRUSH_SIZES.DEFAULT);
  const [selectedTool, setSelectedTool] = useState(DRAWING_TOOLS.PENCIL);
  const [undoStack, setUndoStack] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePos, setMousePos] = useState(null);
  const contextRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const currentStrokeRef = useRef(null); // Accumulate points for current stroke

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    contextRef.current = context;
  }, []);

  // Show popup briefly when becoming a guesser
  useEffect(() => {
    if (!isDrawer) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 2000); // Show for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isDrawer]);

  // Apply drawing history from other players
  useEffect(() => {
    if (!isDrawer && drawingHistory && contextRef.current) {
      redrawCanvas();
    }
  }, [drawingHistory, currentSegments, isDrawer]);

  // Redraw canvas for drawer when history changes (e.g., undo)
  useEffect(() => {
    if (isDrawer && drawingHistory && drawingHistory.length >= 0 && contextRef.current) {
      redrawCanvas();
    }
  }, [drawingHistory, isDrawer]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Clear canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw all actions from history
    drawingHistory.forEach((action) => {
      if (action.type === 'draw' || action.type === 'segment') {
        drawLine(
          action.data.x0,
          action.data.y0,
          action.data.x1,
          action.data.y1,
          action.data.color,
          action.data.size,
          action.data.tool
        );
      } else if (action.type === 'stroke') {
        drawStroke(action.data.points, action.data.color, action.data.size, action.data.tool);
      } else if (action.type === 'clear') {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else if (action.type === 'fill') {
        floodFill(action.data.x, action.data.y, action.data.color);
      }
    });

    // Draw current segments (real-time drawing in progress)
    currentSegments.forEach((segment) => {
      if (segment.type === 'segment') {
        drawLine(
          segment.data.x0,
          segment.data.y0,
          segment.data.x1,
          segment.data.y1,
          segment.data.color,
          segment.data.size,
          segment.data.tool
        );
      }
    });
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    if (!isDrawer) return;
    
    e.preventDefault();
    
    const pos = getCanvasCoordinates(e);
    
    // Handle bucket fill tool
    if (selectedTool === DRAWING_TOOLS.BUCKET) {
      floodFill(pos.x, pos.y, selectedColor);
      onDraw({
        type: 'fill',
        data: {
          x: pos.x,
          y: pos.y,
          color: selectedColor
        }
      });
      return;
    }
    
    setIsDrawing(true);
    lastPosRef.current = pos;
    // Initialize stroke with starting point
    currentStrokeRef.current = {
      points: [pos],
      color: selectedColor,
      size: selectedSize,
      tool: selectedTool
    };
  };

  const handleMouseMove = (e) => {
    if (!isDrawer) return;
    const pos = getCanvasCoordinates(e);
    setMousePos(pos);
    
    if (isDrawing) {
      draw(e);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer) return;
    
    e.preventDefault();
    
    const pos = getCanvasCoordinates(e);
    const prevPos = lastPosRef.current;
    
    // Draw locally
    drawLine(
      prevPos.x,
      prevPos.y,
      pos.x,
      pos.y,
      selectedColor,
      selectedSize,
      selectedTool
    );
    
    // Emit line segment in real-time for other players to see
    onDraw({
      type: 'segment',
      data: {
        x0: prevPos.x,
        y0: prevPos.y,
        x1: pos.x,
        y1: pos.y,
        color: selectedColor,
        size: selectedSize,
        tool: selectedTool
      }
    });
    
    // Add point to current stroke for undo functionality
    if (currentStrokeRef.current) {
      currentStrokeRef.current.points.push(pos);
    }
    
    lastPosRef.current = pos;
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      // If only one point (a click without movement), draw a dot
      if (currentStrokeRef.current.points.length === 1) {
        const point = currentStrokeRef.current.points[0];
        const context = contextRef.current;
        
        if (context) {
          context.beginPath();
          context.arc(point.x, point.y, currentStrokeRef.current.size / 2, 0, Math.PI * 2);
          
          if (currentStrokeRef.current.tool === DRAWING_TOOLS.ERASER) {
            context.fillStyle = 'white';
          } else {
            context.fillStyle = currentStrokeRef.current.color;
          }
          
          context.fill();
          context.closePath();
        }
      }
      
      // Emit the complete stroke
      onDraw({
        type: 'stroke',
        data: currentStrokeRef.current
      });
      currentStrokeRef.current = null;
    }
    setIsDrawing(false);
  };

  const drawLine = (x0, y0, x1, y1, color, size, tool) => {
    const context = contextRef.current;
    if (!context) return;

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    
    if (tool === DRAWING_TOOLS.ERASER) {
      context.strokeStyle = 'white';
      context.lineWidth = size;
    } else {
      context.strokeStyle = color;
      context.lineWidth = size;
    }
    
    context.stroke();
    context.closePath();
  };

  const drawStroke = (points, color, size, tool) => {
    const context = contextRef.current;
    if (!context || !points || points.length === 0) return;

    // If only one point, draw a dot
    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x, points[0].y, size / 2, 0, Math.PI * 2);
      
      if (tool === DRAWING_TOOLS.ERASER) {
        context.fillStyle = 'white';
      } else {
        context.fillStyle = color;
      }
      
      context.fill();
      context.closePath();
      return;
    }

    // Draw stroke with multiple points
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    
    if (tool === DRAWING_TOOLS.ERASER) {
      context.strokeStyle = 'white';
      context.lineWidth = size;
    } else {
      context.strokeStyle = color;
      context.lineWidth = size;
    }
    
    context.stroke();
    context.closePath();
  };

  const floodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];
    const startA = pixels[startPos + 3];
    
    // Convert hex color to RGB
    const hex = fillColor.replace('#', '');
    const fillR = parseInt(hex.substr(0, 2), 16);
    const fillG = parseInt(hex.substr(2, 2), 16);
    const fillB = parseInt(hex.substr(4, 2), 16);
    
    // If same color, don't fill
    if (startR === fillR && startG === fillG && startB === fillB) return;
    
    // Use extremely high tolerance to eliminate all anti-aliased edge pixels
    const tolerance = 200;
    const matchesColor = (r, g, b, a) => {
      // Check if pixel is similar to start color
      const colorMatch = Math.abs(r - startR) <= tolerance &&
                         Math.abs(g - startG) <= tolerance &&
                         Math.abs(b - startB) <= tolerance;
      // Also check if it's not the fill color already
      const notFillColor = !(r === fillR && g === fillG && b === fillB);
      return colorMatch && notFillColor && a > 0;
    };
    
    const width = canvas.width;
    const height = canvas.height;
    const stack = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Uint8Array(width * height);
    const filled = new Uint8Array(width * height);
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const visitIndex = y * width + x;
      if (visited[visitIndex]) continue;
      
      const pos = visitIndex * 4;
      const r = pixels[pos];
      const g = pixels[pos + 1];
      const b = pixels[pos + 2];
      const a = pixels[pos + 3];
      
      if (!matchesColor(r, g, b, a)) continue;
      
      // Scanline fill - fill entire row
      let leftX = x;
      let rightX = x;
      
      // Extend left
      while (leftX > 0) {
        const leftPos = (y * width + leftX - 1) * 4;
        if (!matchesColor(pixels[leftPos], pixels[leftPos + 1], pixels[leftPos + 2], pixels[leftPos + 3])) break;
        leftX--;
      }
      
      // Extend right
      while (rightX < width - 1) {
        const rightPos = (y * width + rightX + 1) * 4;
        if (!matchesColor(pixels[rightPos], pixels[rightPos + 1], pixels[rightPos + 2], pixels[rightPos + 3])) break;
        rightX++;
      }
      
      // Fill the scanline
      for (let i = leftX; i <= rightX; i++) {
        const fillPos = (y * width + i) * 4;
        pixels[fillPos] = fillR;
        pixels[fillPos + 1] = fillG;
        pixels[fillPos + 2] = fillB;
        pixels[fillPos + 3] = 255;
        visited[y * width + i] = 1;
        filled[y * width + i] = 1;
      }
      
      // Add pixels above and below the scanline
      for (let i = leftX; i <= rightX; i++) {
        if (y > 0) stack.push([i, y - 1]);
        if (y < height - 1) stack.push([i, y + 1]);
      }
    }
    
    // Post-processing: Multiple passes to fill any remaining edge pixels
    // Run up to 5 passes to ensure even the most stubborn anti-aliased pixels are filled
    for (let pass = 0; pass < 5; pass++) {
      let foundNew = false;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          if (filled[index]) {
            // Check 8 surrounding pixels (including diagonals)
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const nIndex = ny * width + nx;
                  if (!filled[nIndex]) {
                    const pos = nIndex * 4;
                    const r = pixels[pos];
                    const g = pixels[pos + 1];
                    const b = pixels[pos + 2];
                    const a = pixels[pos + 3];
                    
                    // Fill if similar to start color OR if it's a light anti-aliased pixel
                    const shouldFill = matchesColor(r, g, b, a) || 
                                      (a > 0 && a < 255 && // Semi-transparent
                                       Math.abs(r - startR) <= 250 && 
                                       Math.abs(g - startG) <= 250 && 
                                       Math.abs(b - startB) <= 250);
                    
                    if (shouldFill) {
                      pixels[pos] = fillR;
                      pixels[pos + 1] = fillG;
                      pixels[pos + 2] = fillB;
                      pixels[pos + 3] = 255;
                      filled[nIndex] = 1;
                      foundNew = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
      // If no new pixels were filled, we're done
      if (!foundNew) break;
    }
    
    context.putImageData(imageData, 0, 0);
  };

  const handleClear = () => {
    if (!isDrawer) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  const handleUndo = () => {
    if (!isDrawer) return;
    onUndo();
  };

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={(e) => { stopDrawing(); handleMouseLeave(); }}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isDrawer && mousePos && (selectedTool === DRAWING_TOOLS.PENCIL || selectedTool === DRAWING_TOOLS.ERASER) && (
          <div
            className="brush-preview"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: `${selectedSize}px`,
              height: `${selectedSize}px`,
              backgroundColor: selectedTool === DRAWING_TOOLS.ERASER ? 'rgba(255, 255, 255, 0.8)' : selectedColor,
              border: selectedTool === DRAWING_TOOLS.ERASER ? '2px solid #999' : '1px solid rgba(0, 0, 0, 0.3)'
            }}
          />
        )}
        {!isDrawer && showPopup && (
          <div className="canvas-popup">
            <p>🎨 Watch and guess!</p>
          </div>
        )}
      </div>

      {isDrawer && (
        <div className="canvas-toolbar">
          <div className="tool-section">
            <button
              className={`tool-btn ${selectedTool === DRAWING_TOOLS.PENCIL ? 'active' : ''}`}
              onClick={() => setSelectedTool(DRAWING_TOOLS.PENCIL)}
              title="Pencil"
            >
              ✏️
            </button>
            <button
              className={`tool-btn ${selectedTool === DRAWING_TOOLS.ERASER ? 'active' : ''}`}
              onClick={() => setSelectedTool(DRAWING_TOOLS.ERASER)}
              title="Eraser"
            >
              🧹
            </button>
            <button
              className={`tool-btn ${selectedTool === DRAWING_TOOLS.BUCKET ? 'active' : ''}`}
              onClick={() => setSelectedTool(DRAWING_TOOLS.BUCKET)}
              title="Fill Bucket"
            >
              🪣
            </button>
          </div>

          <div className="tool-section size-slider-section">
            <label>Size: {selectedSize}</label>
            <input
              type="range"
              min={BRUSH_SIZES.MIN}
              max={BRUSH_SIZES.MAX}
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              className="size-slider"
            />
            <span
              className="size-preview"
              style={{
                width: `${selectedSize}px`,
                height: `${selectedSize}px`,
                backgroundColor: selectedTool === DRAWING_TOOLS.ERASER ? '#ccc' : selectedColor
              }}
            />
          </div>

          <div className="color-palette">{COLORS.map((color) => (
              <button
                key={color}
                className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedColor(color);
                  // Only switch to brush if eraser is currently selected
                  if (selectedTool === DRAWING_TOOLS.ERASER) {
                    setSelectedTool(DRAWING_TOOLS.PENCIL);
                  }
                }}
                title={color}
              />
            ))}
            <div className="custom-color-picker">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  // Only switch to brush if eraser is currently selected
                  if (selectedTool === DRAWING_TOOLS.ERASER) {
                    setSelectedTool(DRAWING_TOOLS.PENCIL);
                  }
                }}
                className="color-picker-input"
                title="Choose custom color"
              />
              <span className="color-picker-label">🎨</span>
            </div>
          </div>

          <div className="tool-section">
            <button className="action-btn" onClick={handleUndo} title="Undo">
              ↶ Undo
            </button>
            <button className="action-btn clear-btn" onClick={handleClear} title="Clear">
              🗑️ Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
