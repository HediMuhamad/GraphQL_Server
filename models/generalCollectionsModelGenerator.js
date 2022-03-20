
import mongoose from "mongoose";
mongoose.pluralize(null);

const compiledModels = {};

const model = (collectionName) => {
    compiledModels[collectionName] = compiledModels[collectionName] || new mongoose.model(collectionName, new mongoose.Schema({},{strict: false}));
    return compiledModels[collectionName];
};

export default model;