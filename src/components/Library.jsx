import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Spinner, Dropdown, Card  } from 'react-bootstrap';
import {format} from 'timeago.js';

const Library = () => {

  const navigate = useNavigate();
    const [drawings, setDrawings] = useState([]);
    const canvasRef = useRef();
    const ctxRef = useRef();

    const [loading, setLoading] = useState(true);

    // Fetch stored drawings from the backend
    useEffect(() => {
        const fetchDrawings = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/drawings");
            console.log(response);
            setDrawings(response.data.alldrawings); // Assuming the API returns an array of drawings
        } catch (error) {
            console.error("Error fetching drawings:", error);
        }finally{
          setLoading(false);
        }
        };

        fetchDrawings();
    }, []);

    // Render each drawing on a canvas and convert to image
    const renderDrawingToImage = (elements) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctxRef.current = ctx;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw all elements from the drawing
        elements.forEach((element) => {
        if (element.type === "line") {
            drawLine(ctx, element.start.x, element.start.y, element.end.x, element.end.y);
        } else if (element.type === "circle") {
            drawCircle(ctx, element.center.x, element.center.y, element.radius);
        } else if (element.type === "text") {
            drawText(ctx, element.x, element.y, element.text);
        }else if (element.type === "rectangle") {
          drawRectangle(element.start.x, element.start.y, element.width, element.height);
      }else if(element.type === "pencil"){
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
        // Add other element types here (e.g., rectangle, pencil strokes)
        });

        // Return the canvas as an image
        return canvas.toDataURL();
    };

    // Functions to draw individual shapes
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

    // Draw a rectangle
  const drawRectangle = (rx, ry, width, height) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.strokeRect(rx, ry, width, height);
    
  }

    // Handle clicking on a drawing card (e.g., load it into main canvas)
    const handleCardClick = (drawing) => {
        // Logic to load the drawing into the main canvas for viewing/editing
        console.log("Selected Drawing:", drawing);
        navigate(`/drawing/${drawing._id}`, {state:drawing});
    };

    const handleNewDrawing = () => {
      navigate('/newdrawing');
    };

    const handleDeleteDrawing = async (drawingId) => {
      try {
        console.log(drawingId);
        const data = await axios.delete(`http://localhost:5000/api/drawings/${drawingId}`);
        console.log(data);
        setDrawings(drawings.filter(drawing => drawing._id !== drawingId));
      } catch (error) {
        console.error("Error deleting drawing:", error);
      }
    };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h1>Drawing Library</h1>
          <Button variant="primary" onClick={handleNewDrawing}>
            New Drawing
          </Button>
        </Col>
      </Row>
      <Row>
      {/* Hidden Canvas for Rendering Drawing Images */}
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
      ):(
        <Row xs={1} md={2} lg={3} className="g-3">
          {drawings.map((drawing, index) => (
            <Col key={index}>
            <Card className="h-100">
            <Card.Img 
            variant="top"
            src={renderDrawingToImage(drawing.elements)}
            alt={`Drawing ${drawing._id}`}
            style={{ height: "200px", objectFit: "cover", cursor: "pointer", objectPosition:'5% 90%' }}
            onClick={() => handleCardClick(drawing)} 
            />
            <Card.Body className='d-flex flex-column'>
              <div style={{display:"flex",flexDirection:"row",justifyContent:"center"}}>
              <Card.Title>{drawing.title}</Card.Title>
              </div>
            <Button
              variant="danger"
              size="sm"
              // style={{ position: "absolute", top: "10px", right: "10px" }}
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
      // <div style={{ display: "flex", flexWrap: "wrap", justifyContent: 'center' }}>
      //   {drawings.map((drawing,index) => (
      //     <div
      //       key={index}
      //       style={{
      //         border: "1px solid #ccc",
      //         margin: "10px",
      //         padding: "10px",
      //         // position: "relative",
      //         // cursor: "pointer",
      //       }}
      //     >
      //       <div style={{display:"flex", flexDirection:"column", justifyContent:"center"}}>
      //       <img
      //         onClick={() => handleCardClick(drawing)}
      //         src={renderDrawingToImage(drawing.elements)}
      //         alt={`Drawing ${drawing.id}`}
      //         style={{ width: "150px", height: "150px", cursor: "pointer" }}
              
      //       />
      //       <p>{drawing.title}</p>
      //       <Button
      //             variant="danger"
      //             size="sm"
      //             // style={{ position: "absolute", top: "10px", right: "10px" }}
      //             onClick={() => handleDeleteDrawing(drawing._id)}
      //         >
      //         Delete
      //       </Button>
      //       </div>
      //     </div>
      //   ))}
      // </div>
      )}
      
      </Row>
    </Container>
  )
}

export default Library