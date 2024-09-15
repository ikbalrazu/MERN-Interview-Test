const express = require("express");
const cors = require("cors");
require("dotenv").config();
const databaseConnect = require("./config/database");

//route
const drawingRoute = require("./Routes/drawingRoutes");

const app = express();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());


const PORT = 5000

//routes
app.use("/api/v1", drawingRoute);

app.use((err,req,res,next)=>{
    res.status(err.statuscode).json({
        success: false,
        error: err.message,
    })
})

app.listen(PORT, function(error){
    if(error){
        console.log("Server Failed");
    }else{
        databaseConnect();
        console.log(`Server Success PORT ${PORT}`);
    }
})