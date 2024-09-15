const mongoose = require("mongoose");

// Define the Drawing schema
const drawingSchema = new mongoose.Schema({
  title: { type: String },
    elements: [
      {
        type: { type: String },
        start: { x: Number, y: Number },
        end: { x: Number, y: Number },
        points: [{ x: Number, y: Number }],
        center: { x: Number, y: Number },
        height: Number,
        width: Number,
        radius: Number,
        color: String,
        text: String,
        x: Number,
        y: Number,
        lineWidth: Number,
      }
    ]
},
{ timestamps: true }
);
  
const Drawing = mongoose.model("Drawing", drawingSchema);

module.exports = Drawing;