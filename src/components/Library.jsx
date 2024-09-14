import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Library = () => {

  const navigate = useNavigate();
    const [drawings, setDrawings] = useState([]);
    const canvasRef = useRef(null);

    // Fetch stored drawings from the backend
    useEffect(() => {
        const fetchDrawings = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/drawings");
            console.log(response);
            setDrawings(response.data.alldrawings); // Assuming the API returns an array of drawings
        } catch (error) {
            console.error("Error fetching drawings:", error);
        }
        };

        fetchDrawings();
    }, []);

    // Render each drawing on a canvas and convert to image
    const renderDrawingToImage = (elements) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

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

    // Handle clicking on a drawing card (e.g., load it into main canvas)
    const handleCardClick = (drawing) => {
        // Logic to load the drawing into the main canvas for viewing/editing
        console.log("Selected Drawing:", drawing);
        navigate(`/drawing/${drawing._id}`, {state:drawing});
    };

  return (
    <div>
      {/* Hidden Canvas for Rendering Drawing Images */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={300}
        height={300}
      ></canvas>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {drawings.map((drawing,index) => (
          <div
            key={drawing.id}
            onClick={() => handleCardClick(drawing)}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            <img
              src={renderDrawingToImage(drawing.elements)}
              alt={`Drawing ${drawing.id}`}
              style={{ width: "150px", height: "150px" }}
            />
            <p>{drawing.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Library