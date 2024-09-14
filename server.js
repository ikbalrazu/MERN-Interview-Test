const express = require("express");
const cors = require("cors");
require("dotenv").config();
const databaseConnect = require("./config/database");
const Drawing = require("./Model/drawingModel");

const app = express();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

const PORT = 5000

app.get("/",(req,res)=>{
    res.send("Whiteboard App");
})

// API to save the drawing
app.post("/api/drawing", async (req, res) => {
    try {
        const { elements, title } = req.body;

        console.log(title);
  
        const drawing = new Drawing({ title, elements });
        await drawing.save();
  
        res.status(201).json({ message: "Drawing saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save drawing" });
    }
});

app.put("/api/drawing",async(req,res)=>{
    try {

        const UpdatedDrawing = {
            title: req.body.title,
            elements: req.body.elements
        }
        const drawing = await Drawing.findByIdAndUpdate(req.body.id, UpdatedDrawing,
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        );

        res.status(200).json({
            success: true,
            
        })
        
    } catch (error) {
        console.log(error.message);
    }
})

// API to get drawings by id
app.get("/api/drawings/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        const drawings = await Drawing.findById(id);
        // console.log(drawings);
        res.status(200).json(drawings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch drawings by id" });
    }
});

// API to get all drawings
app.get("/api/drawings", async (req, res) => {
    try {
        const alldrawings = await Drawing.find();
        res.status(200).json({
            success:true,
            alldrawings,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch all drawings" });
    }
});

app.listen(PORT, function(error){
    if(error){
        console.log("Server Failed");
    }else{
        databaseConnect();
        console.log(`Server Success PORT ${PORT}`);
    }
})