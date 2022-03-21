import mongoose from "mongoose"
mongoose.pluralize(null);

const CollectionRefSchema = new mongoose.Schema({
    availableItems: {
        type: [mongoose.ObjectId],
        required: true,
    },
    unavailableItems: {
        type: [mongoose.ObjectId],
        required: true,
    }
})

export default (collectionName)=>(new mongoose.model(collectionName, CollectionRefSchema));