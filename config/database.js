const mongoose = require("mongoose");

const databaseConnect = async() => {
    // mongoose.set('strictQuery', true);
    try{
        const conn = await mongoose.connect(process.env.DB_URI,{
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log(`Error: ${error.message}`);
        process.exit();
    }

}

module.exports = databaseConnect;