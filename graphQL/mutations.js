import { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLBoolean } from "graphql";
import data from '../data/store.json' assert { type: 'json' };
import { CollectionInputType, CollectionType, ItemInputType, ReturnType } from "./types.js";

/* Resolvers ******************************************************************* */
const addNewCollections = (parent, args)=>{

    const { collections } = args;
    const failed = [];
    const successed = [];

    collections.forEach((collection)=>{
        let { title } = collection
        const { items } = collection;
        const routeName = title.toLowerCase();
        title = title[0].toUpperCase() + title.slice(1, title.length).toLowerCase(); 
    

        if(!!data.store.collections.find(item =>item.routeName===routeName)){
            failed.push(title);
            return;
        }
    
        successed.push(title);
        data.store.collections.push({
            title,
            routeName,
            items
        })

    })

    return {
        all: failed.concat(successed),
        successed,
        failed,
        additionalInfo: failed.length>0 ? "Existed collection/s failed in adding proccess." : null
    }

}

const removeCollections = (parent, args)=>{
    let {routeNames} = args;

    const failed = [];
    const successed = [];

    routeNames.forEach((routeName)=>{       
        routeName = routeName.toLowerCase();

        if(!data.store.collections.find((collection)=>collection.routeName===routeName)){
            failed.push(routeName);
            return;
        }
        
        successed.push(routeName);
        data.store.collections = data.store.collections.filter((collection)=>collection.routeName!==routeName); 
    });


    return {
        all: failed.concat(successed),
        successed,
        failed,
        additionalInfo: failed.length>0 ? "Non-existed collection/s failed in removing proccess." : null
    }
}

const addItems = (parent, args)=>{
    const routeName = args.routeName.toLowerCase();

    const collectionIndex = data.store.collections.findIndex(item =>item.routeName===routeName)
    if(collectionIndex !== 0 && !collectionIndex){
        throw Error({
            code: "444",
            message: "collection not found",
        });
    }
    
    const { items } = args;
    const storedItems = data.store.collections[collectionIndex].items;
    
    const newItems = [];
    const successed = []
    const failed = []
    
    // Prevent from redunancy
    outer: 
    for(let i=0;i<items.length;i++){
        for(let j=0;j<storedItems.length;j++){
            if(items[i].id === storedItems[j].id){
                failed.push(items[i].id);
                continue outer;
            }
        }
        newItems.push(items[i])
        successed.push(items[i].id);
    }


    data.store.collections[collectionIndex].items = storedItems.concat(newItems); 

    return {
        all: failed.concat(successed),
        successed,
        failed,
        additionalInfo: failed.length>0 ? "Existed item/s failed in adding proccess" : null
    }
}

/* Mutations ***************************************************************** */

const RootMutation = new GraphQLObjectType({
    name: "RootMutation",
    fields: {
        addNewCollections: {
            type: ReturnType,
            args: {
                collections: {
                    type: new GraphQLNonNull(new GraphQLList(CollectionInputType)),
                }
            },
            resolve: addNewCollections
        },
        removeCollections: {
            type: ReturnType,
            args: {
                routeNames: {
                    type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
                    defaultValue: false
                }
            },
            resolve: removeCollections
        },
        addItems: {
            type: ReturnType,
            args: {
                routeName: {
                    type: new GraphQLNonNull(GraphQLString),
                    defaultValue: null
                },
                items: {
                    type: new GraphQLNonNull(new GraphQLList(ItemInputType)),
                    defaultValue: null
                }
            },
            resolve: addItems 
        },
    }
});


export default RootMutation