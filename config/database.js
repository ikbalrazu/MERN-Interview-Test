const mongoose = require("mongoose");

const databaseConnect = async() => {
    // mongoose.set('strictQuery', true);
    try{
        const conn = await mongoose.connect(process.env.DB_URI,{
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // console.log("MongoDB Connected");
    }catch(error){
        console.log(`Error: ${error.message}`);
        process.exit();
    }

    // mongoose.connect(process.env.DB_URI,{
    //     useNewUrlParser: true,
    //     useUnifiedTopology:true
    // }).then((data)=>{
    //     console.log(`Mongodb connected with server: ${data.connection.host}`);
    // }).catch((err)=>{
    //     // console.log(err.message);
    //     process.exit();
    // })
}

module.exports = databaseConnect;