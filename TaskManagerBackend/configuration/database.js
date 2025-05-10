
import mongoose from 'mongoose';
import color from 'picocolors'; 

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log(color.green(' - MongoDB connected successfully'));
    }catch(err){
        console.error(color.red(' - Error connecting to MongoDB: ', err));
        process.exit(1); // Exit the process with failure
    }
}

export { connectDB };