const mongoose = require("mongoose");

// Define the Drawing schema
const drawingSchema = new mongoose.Schema({
    elements: [
      {
        type: { type: String },
        start: { x: Number, y: Number },
        end: { x: Number, y: Number },
        points: [{ x: Number, y: Number }],
        center: { x: Number, y: Number },
        radius: Number,
        color: String,
        lineWidth: Number,
      }
    ]
});
  
const Drawing = mongoose.model("Drawing", drawingSchema);

module.exports = Drawing;