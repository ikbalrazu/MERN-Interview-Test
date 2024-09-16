import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Spinner, Card } from 'react-bootstrap';
import { format } from 'timeago.js';

const Library = () => {

  const navigate = useNavigate();
  const [drawings, setDrawings] = useState([]);
  const canvasRef = useRef();
  const ctxRef = useRef();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState();

  const fetchDrawings = async () => {
    try {
      const response = await axios.get("/drawings");
      if(response.data.alldrawings.length === 0){
        setError("No drawing found!");
      }
      setDrawings(response.data.alldrawings);
    } catch (error) {
      setError("Failed to load drawings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawings();
  }, [error]);

  const renderDrawingToImage = (elements) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      ctx.strokeStyle = element.color || "black";  // Set stroke color from the element
      ctx.lineWidth = element.lineWidth || 1;      // Set line width from the element
      if (element.type === "line") {
        drawLine(ctx, element.start.x, element.start.y, element.end.x, element.end.y);
      } else if (element.type === "circle") {
        drawCircle(ctx, element.center.x, element.center.y, element.radius);
      } else if (element.type === "text") {
        drawText(ctx, element.x, element.y, element.text);
      } else if (element.type === "rectangle") {
        drawRectangle(element.start.x, element.start.y, element.width, element.height);
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

      }
    });
    return canvas.toDataURL();
  };

  const drawLine = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawCircle = (ctx, cx, cy, radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawText = (ctx, x, y, text) => {
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y);
  };

  const drawRectangle = (rx, ry, width, height) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.strokeRect(rx, ry, width, height);

  }

  const handleCardClick = (drawing) => {
    navigate(`/drawing/${drawing._id}`, { state: drawing });
  };

  const handleNewDrawing = () => {
    navigate('/newdrawing');
  };

  const handleDeleteDrawing = async (drawingId) => {
    try {
      const data = await axios.delete(`/drawings/${drawingId}`);

      if (data.data.success === true) {
        setDrawings(drawings.filter(drawing => drawing._id !== drawingId));
      }

    } catch (error) {
      console.error("Failed to delete drawing. Please try again.");
    }
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h1>Whiteboard App</h1>
          <Button variant="primary" onClick={handleNewDrawing}>
            New Drawing
          </Button>
        </Col>
      </Row>
      <Row>

        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width={300}
          height={300}
        ></canvas>
        {loading ? (
          <div className="text-center" style={{ width: '100%' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-3">
            {drawings.map((drawing, index) => (
              <Col key={index}>
                <Card className="h-100">
                  <Card.Img
                    variant="top"
                    src={renderDrawingToImage(drawing.elements)}
                    alt={`Drawing ${drawing._id}`}
                    style={{ height: "200px", objectFit: "cover", cursor: "pointer", objectPosition: '5% 90%' }}
                    onClick={() => handleCardClick(drawing)}
                  />
                  <Card.Body className='d-flex flex-column'>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                      <Card.Title>{drawing.title}</Card.Title>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteDrawing(drawing._id)}
                    >
                      Delete
                    </Button>
                    <Card.Footer className='d-flex justify-content-center'>
                      <small className="text-muted">{format(drawing.updatedAt)}</small>
                    </Card.Footer>
                  </Card.Body>
                </Card>
              </Col>

            ))}
          </Row>
        )}

      </Row>
    </Container>
  )
}

export default Library