const Drawing = require("../Models/drawingModel");
const ErrorHandler = require("../utils/ErrorHandler");

// API logic to save the drawing
exports.newDrawing = async(req,res,next) => {

    try {
        const { elements, title } = req.body;
        if (!title || !elements) {
            return next(new ErrorHandler("Title and elements are required", 400));
        }
        const drawing = new Drawing({ title, elements });
        await drawing.save();
  
        res.status(201).json({
            success:true, 
            drawing
        });

    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};

// API logic to get all drawings
exports.getAllDrawings = async (req, res, next) => {
    try {
        
        const alldrawings = await Drawing.find().sort({ updatedAt: -1 });
        res.status(200).json({
            success:true,
            alldrawings,
        });

    } catch (error) {
        next(new ErrorHandler("Failed to fetch all drawings", 500));
    }
};

// API logic to get drawings by id
exports.getDrawingById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const drawings = await Drawing.findById(id);
        console.log(drawings);
        if(!drawings){
            return next(new ErrorHandler("Drawing not found!", 404));
        }

        res.status(200).json({
            success:true,
            drawings
        });

    } catch (error) {
        next(new ErrorHandler("Failed to retrieve drawing", 500));
    }
};

//API logic for update drawing
exports.updateDrawing = async(req,res,next)=>{
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

        if (!drawing) {
            return next(new ErrorHandler("Drawing not found", 404));
        }

        res.status(200).json({
            success: true,
            drawing
        })
        
        
    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};

//API logic for delete drawing
exports.deleteDrawing = async(req,res,next)=>{
    try {
        
        const drawing = await Drawing.deleteOne({_id:req.params.drawingId});

        res.status(200).json({
            success:true,
            delete: drawing
        })

    } catch (error) {
        next(new ErrorHandler("Failed to delete drawing", 500));
    }
};
