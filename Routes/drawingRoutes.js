const Router = require('express').Router();
const {
    newDrawing, 
    getAllDrawings, 
    getDrawingById, 
    updateDrawing, 
    deleteDrawing
} = require("../Controllers/drawingController")

Router.get("/drawings", getAllDrawings);
Router.get("/drawings/:id", getDrawingById);
Router.post("/drawings/new", newDrawing);
Router.put("/drawings/update", updateDrawing);
Router.delete("/drawings/:drawingId", deleteDrawing);

module.exports = Router;

