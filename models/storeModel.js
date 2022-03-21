import mongoose from "mongoose"
mongoose.pluralize(null);

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        pre: function(){
            return this.name.toLowerCase().split(" ").reduce((made, current)=>{
                if(current.length===0) return made;
                return made+=("_"+(current[0].toUpperCase + current.substring(1, current.length()).toLowerCase()));
            }, "")
        }
    },
    location: {
        type: String,
        required: true,
    },
    collections: {
        type: [String],
        required: true
    }
});

export default new mongoose.model("stores", storeSchema);