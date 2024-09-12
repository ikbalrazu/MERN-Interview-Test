import React, { useEffect, useRef, useState } from 'react'



const Whiteboard = () => {
    const canvasref = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [drawingElements, setDrawingElements] = useState([]);
    const [context, setContext] = useState(null);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState("line"); // line, rectangle, circle, text
    const [textInput, setTextInput] = useState("");

    useEffect(()=>{
        const canvas = canvasref.current;
        const ctx = canvas.getContext("2d");
        console.log(ctx);
        setContext(ctx);
    },[]);

    const startDrawing = ({nativeEvent}) => {
        console.log(nativeEvent);
        const { offsetX, offsetY } = nativeEvent;
        setStartPoint({ x: offsetX, y: offsetY });
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setDrawing(true);

        if(tool === "text"){
            //add text on mouse click
            context.font = "20px Arial";
            context.fillText(textInput,offsetX, offsetY);
            setTextInput("") // Clear input after adding text
        }
    }

    const Draw = ({nativeEvent}) => {
        if(!drawing || tool === "text") return;

        const { offsetX, offsetY } = nativeEvent;
        const width = offsetX - startPoint.x;
        const height = offsetY - startPoint.y;
        context.clearRect(0,0, canvasref.current.width, canvasref.current.height); // Clear canvas before each draw

        if(tool === "line"){
            context.beginPath();
            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(offsetX, offsetY);
            context.stroke();
        }else if(tool === "rectangle"){
            context.strokeRect(startPoint.x, startPoint.y, width, height);
        }else if(tool === "circle"){
            context.beginPath();
            const radius = Math.sqrt(width * width + height * height);
            context.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
            context.stroke();
        }else if(tool === "pencil"){
            // context.beginPath();
            context.lineTo(offsetX, offsetY);
            context.stroke();
            
            // setStartPoint((prevPoints) => [...prevPoints, { x: offsetX, y: offsetY }]);

        }
        

    }

    const stopDrawing = () => {
        // context.closePath();
        setDrawing(false);

    }

    const finishDrawing = (event) => {
        const { offsetX, offsetY } = event.nativeEvent;
        // setDrawing(false);
        // ctxRef.current.closePath();
    
        // Capture element for saving
        let newElement = {};
        if (currentTool === "pencil") {
          newElement = {
            type: "pencil",
            points: [{ x: startPoint.x, y: startPoint.y }, { x: offsetX, y: offsetY }],
            color: "black",
            lineWidth: 2
          };
        } else if (currentTool === "line") {
          newElement = {
            type: "line",
            start: { x: startPoint.x, y: startPoint.y },
            end: { x: offsetX, y: offsetY },
            color: "black",
            lineWidth: 2
          };
          drawLine(startPoint.x, startPoint.y, offsetX, offsetY);
        } else if (currentTool === "circle") {
          const radius = Math.sqrt(Math.pow(offsetX - startPoint.x, 2) + Math.pow(offsetY - startPoint.y, 2));
          newElement = {
            type: "circle",
            center: { x: startPoint.x, y: startPoint.y },
            radius,
            color: "black",
            lineWidth: 2
          };
          drawCircle(startPoint.x, startPoint.y, radius);
        }
    
        setDrawingElements((prev) => [...prev, newElement]);
    };

    // Draw a line
  const drawLine = (x1, y1, x2, y2) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  return (
    <div>
        <button onClick={() => setTool("pencil")}>Pencil</button>
        <button onClick={() => setTool("line")}>Line</button>
        <button onClick={() => setTool("rectangle")}>Rectangle</button>
        <button onClick={() => setTool("circle")}>Circle</button>
        <button onClick={() => setTool("text")}>Text</button>
        <div>
        {tool === "text" && (
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text"
          />
        )}
        </div>
        <canvas
        ref={canvasref}
        width="800"
        height="600"
        style={{border:"1px solid red"}}
        onMouseDown={startDrawing}
        onMouseMove={Draw}
        onMouseUp={finishDrawing}
        onMouseLeave={stopDrawing}
        />
    </div>
  )
}

export default Whiteboard