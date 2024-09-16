import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Container, Row, OverlayTrigger, Tooltip, Form, InputGroup, Button } from 'react-bootstrap';
import { FaPencilAlt, FaRuler, FaCircle, FaSquare, FaTextHeight, FaTrash, FaUndo, FaRedo } from "react-icons/fa";

const Whiteboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  let random_title = (Math.random() + 1).toString(36).substring(7);
  const canvasRef = useRef();
  const ctxRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState("select");
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [drawingElements, setDrawingElements] = useState([]);

  const [selectedColor, setSelectedColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(1);

  const [title, setTitle] = useState();

  const [redoStack, setRedoStack] = useState([]);

  const [currentPencilStroke, setCurrentPencilStroke] = useState([]);

  useEffect(() => {

    if (state) {
      fetchDrawings();
    } else {
      const canvas = canvasRef.current;
      canvas.width = 900;
      canvas.height = 700;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
      ctxRef.current = ctx;
      setTitle(random_title)
    }

  }, []);

  // Handle mouse down event to start drawing
  const startDrawing = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setStartPoint({ x: offsetX, y: offsetY });
    setRedoStack([]);

    ctxRef.current.strokeStyle = selectedColor; // Set current color
    ctxRef.current.lineWidth = lineWidth; // Set current line width

    if (currentTool === "pencil") {
      setIsDrawing(true);
      setCurrentPencilStroke([{ x: offsetX, y: offsetY }]); // Start tracking the stroke
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
    }
    else if (currentTool === "text") {
      const text = prompt("Enter text: ");
      if (text) {
        addText(offsetX, offsetY, text);
        setDrawingElements((prev) => [
          ...prev,
          { type: "text", x: offsetX, y: offsetY, text, color: selectedColor }
        ]);
      }
    } else {
      setIsDrawing(true);
    }

  };

  // Handle mouse move event to draw on the canvas
  const draw = (event) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = event.nativeEvent;

    ctxRef.current.strokeStyle = selectedColor;
    ctxRef.current.lineWidth = lineWidth;

    if (currentTool === "pencil") {
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
      setCurrentPencilStroke((prev) => [...prev, { x: offsetX, y: offsetY }]); // Add each point to the current stroke

    }
  };

  // Handle mouse up event to finish drawing
  const finishDrawing = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setIsDrawing(false);

    const ctx = ctxRef.current;
    ctx.closePath();

    // Capture the drawn element for saving
    let newElement = {};

    ctxRef.current.strokeStyle = selectedColor;
    ctxRef.current.lineWidth = lineWidth;

    if (currentTool === "line") {
      newElement = {
        type: "line",
        start: { x: startPoint.x, y: startPoint.y },
        end: { x: offsetX, y: offsetY },
        color: selectedColor,
        lineWidth: lineWidth,
      };
      drawLine(startPoint.x, startPoint.y, offsetX, offsetY);
    } else if (currentTool === "circle") {
      const radius = Math.sqrt(Math.pow(offsetX - startPoint.x, 2) + Math.pow(offsetY - startPoint.y, 2));
      newElement = {
        type: "circle",
        center: { x: startPoint.x, y: startPoint.y },
        radius,
        color: selectedColor,
        lineWidth: lineWidth,
      };
      drawCircle(startPoint.x, startPoint.y, radius);
    } else if (currentTool === "rectangle") {
      const width = offsetX - startPoint.x;
      const height = offsetY - startPoint.y;
      newElement = {
        type: "rectangle",
        start: { x: startPoint.x, y: startPoint.y },
        width,
        height,
        color: selectedColor,
        lineWidth: lineWidth,
      };
      drawRectangle(startPoint.x, startPoint.y, width, height);
    }
    else if (currentTool === "pencil" && currentPencilStroke.length > 0) {
      setDrawingElements((prev) => [
        ...prev,
        { type: "pencil", points: currentPencilStroke, color: selectedColor, lineWidth: lineWidth },
      ]);
      setCurrentPencilStroke([]); // Reset the stroke
    }

    if (newElement.type) {
      setDrawingElements((prev) => [...prev, newElement]);
    }
  };

  // Draw a line
  const drawLine = (x1, y1, x2, y2) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Draw a circle
  const drawCircle = (cx, cy, radius) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  };

  // Draw a rectangle
  const drawRectangle = (rx, ry, width, height) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.strokeRect(rx, ry, width, height);

  }

  // Function to add text to the canvas
  const addText = (x, y, text) => {
    const ctx = ctxRef.current;
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y);
  };

  // Clear the canvas and reset elements
  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setDrawingElements([]);
    setRedoStack([]);
  };

  const saveDrawing = async () => {
    try {
      if (state) {
        const drawing = await axios.put("/drawings/update", {
          elements: drawingElements,
          title: title,
          id: state._id
        });
        if(!drawing){
          alert("Something went wrong! Updated Failed");
        }
        alert("Drawing updated successfully!");
      } else {
        const drawing = await axios.post("/drawings/new", {
          elements: drawingElements,
          title: title,
        });
        if(!drawing){
          alert("Something went wrong! Saved Failed");
        }
        alert("Drawing saved successfully!");
      }

    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const fetchDrawings = async () => {
    setDrawingElements(state?.elements);
    setTitle(state?.title);
    const canvas = canvasRef.current;
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;
    const savedElements = state?.elements; // Get the first drawing for simplicity
    savedElements.forEach((element) => {
      ctx.strokeStyle = element.color || "black";  // Set stroke color from the element
      ctx.lineWidth = element.lineWidth || 1; // Set line width from the element

      if (element.type === "line") {
        drawLine(element.start.x, element.start.y, element.end.x, element.end.y);
      } else if (element.type === "circle") {
        drawCircle(element.center.x, element.center.y, element.radius);
      } else if (element.type === "pencil") {
        const ctx = ctxRef.current;
        ctx.beginPath();
        ctx.moveTo(element.points[0].x, element.points[0].y); // Start from the first point

        element.points.forEach((point, index) => {
          if (index > 0) {
            ctx.lineTo(point.x, point.y); // Draw lines to each subsequent point
          }
        });

        ctx.stroke(); // Complete the stroke

      } else if (element.type === "rectangle") {
        drawRectangle(element.start.x, element.start.y, element.width, element.height)
      } else if (element.type === "text") {
        addText(element.x, element.y, element.text)
      }
    });
  };

  // Undo the last drawing action
  const undoDrawing = () => {
    setDrawingElements((prev) => {
      if (prev.length === 0) return prev;
      const updatedElements = prev.slice(0, -1);
      setRedoStack((redo) => [...redo, prev[prev.length - 1]]); // Add the undone element
      redrawCanvas(updatedElements);
      return updatedElements;
    });
  };

  // Redo the last undone action
  const redoDrawing = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const lastUndoneElement = prev[prev.length - 1];
      setDrawingElements((elements) => [...elements, lastUndoneElement]);
      redrawCanvas([...drawingElements, lastUndoneElement]);
      return prev.slice(0, -1); // Remove the redone element from redo stack
    });
  };

  // Redraw the canvas with remaining elements
  const redrawCanvas = (elements) => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    elements.forEach((element) => {
      ctx.strokeStyle = element.color || "black";
      ctx.lineWidth = element.lineWidth || 1;
      if (element.type === "line") {
        drawLine(element.start.x, element.start.y, element.end.x, element.end.y);
      } else if (element.type === "circle") {
        drawCircle(element.center.x, element.center.y, element.radius);
      } else if (element.type === "pencil") {
        ctx.beginPath();
        element.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }

        });
        ctx.stroke();
      } else if (element.type === "rectangle") {
        ctx.strokeRect(element.start.x, element.start.y, element.width, element.height);
      } else if (element.type === "text") {
        addText(element.x, element.y, element.text);
      }
    });
  };

  const NewDrawingHandler = () => {
    if (drawingElements) {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setDrawingElements([]);
      setRedoStack([]);
      setTitle(random_title);
    }
    navigate("/newdrawing");
  }

  return (
    <Container fluid>
      <Row className="mt-2">
        <Col></Col>
        <Col className="d-flex justify-content-center">
          <InputGroup className="mb-1">
            <InputGroup.Text>Title</InputGroup.Text>
            <Form.Control onChange={(e) => { setTitle(e.target.value) }} aria-label="First name" value={title} />
          </InputGroup>
        </Col>
        <Col  className="d-flex flex-row justify-content-center gap-2 mb-1">
        <Button
            onClick={saveDrawing}
            disabled={drawingElements.length === 0}
          >Save Drawing</Button>
          <button onClick={() => { navigate("/") }}>Library</button>
          <button onClick={NewDrawingHandler}>New Drawing</button>
        </Col>
        <Col></Col>
      </Row>
      <Row>
        <Col sm={1} className="d-flex flex-column align-items-center p-2" style={{ backgroundColor: "#f8f9fa" }}>
          <h4>Tools</h4>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Pencil</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={() => setCurrentTool("pencil")}><FaPencilAlt className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Line</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={() => setCurrentTool("line")}> <FaRuler className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Circle</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={() => setCurrentTool("circle")}><FaCircle className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Rectangle</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={() => setCurrentTool("rectangle")}><FaSquare className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Text</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={() => setCurrentTool("text")}><FaTextHeight className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Clear</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={clearCanvas}><FaTrash className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Undo</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={undoDrawing}><FaUndo className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Redo</Tooltip>}>
            <button variant="primary" className="mb-2" onClick={redoDrawing}><FaRedo className="me-2" /></button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">Color</Tooltip>}>
            <Form.Control
              className="mb-2"
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-pencil">lineWidth</Tooltip>}>
          <Form.Range
            type="range"
            min="1"
            max="5"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            style={{
              backgroundColor: "#fff",
              color: "black",
              appearance: 'none'
            }}
          />
          </OverlayTrigger>
        </Col>
        <Col sm={11}>
          <canvas
            id="canvas"
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={finishDrawing}
            style={{ border: "1px solid black"}}
          />
    
        </Col>
      </Row>
      
    </Container>
  )
}

export default Whiteboard