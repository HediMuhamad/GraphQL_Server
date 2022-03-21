import mongoose from "mongoose";
mongoose.pluralize(null);

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        pre: function(){
            return this.name.split(" ").reduce((made, current)=>{
                if(current.length===0) return made;
                return made+=(" "+(current[0].toUpperCase + current.substring(1, current.length()).toLowerCase()));
            }, "")
        },
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    imageUrl: {
        type: String,
        required: true
    }
})

export default (collectionName)=>(new mongoose.model(collectionName, itemSchema));