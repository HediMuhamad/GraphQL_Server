import { GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLString, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLInputObjectType, GraphQLBoolean } from "graphql";
import data from '../data/store.json' assert { type: 'json' };
import { CollectionType, ItemInputType } from "./types.js";

/* Resolvers ******************************************************************* */
const addNewCollection = (parent, args)=>{
    const { items } = args;
    let { title } = args;
    const routeName = title.toLowerCase();

    title = title[0].toUpperCase() + title.slice(1, title.length).toLowerCase(); 

    if(!!data.store.collections.find(item =>item.routeName===routeName)){
        throw Error("A collection with same title and route-name exist");
    }

    data.store.collections.push({
        title,
        routeName,
        items
    })

    return data.store.collections.find(item =>item.routeName===routeName);
}

const removeCollections = (parent, args)=>{
    let {routeNames} = args;

    const failedStuff = []

    routeNames.forEach((routeName)=>{       
        routeName = routeName.toLowerCase();

        if(!data.store.collections.find((collection)=>collection.routeName===routeName)){
            failedStuff.push(routeName);
        }
    
        data.store.collections = data.store.collections.filter((collection)=>collection.routeName!==routeName); 
    });

    if(failedStuff.length>0){
        throw Error(`Not exist route names: [${failedStuff}], other(s) removed successfully.`)
    }

    return true;
}

const addItems = (parent, args)=>{
    const { items } = args;
    const routeName = args.routeName.toLowerCase();

    const collectionIndex = data.store.collections.findIndex(item =>item.routeName===routeName)

    
    if(collectionIndex !== 0 && !collectionIndex){
        throw Error(`There is no collection with route-name (${routeName}) in the store.`);
    }

    
    const storedItems = data.store.collections[collectionIndex].items;
    
    const newItems = []
    
    // Prevent from redunancy
    outer: 
    for(let i=0;i<items.length;i++){
        for(let j=0;j<storedItems.length;j++){
            if(items[i].id === storedItems[j].id){
                console.log("Continue");
                continue outer;
            }
        }
        newItems.push(items[i]);
    }

    data.store.collections[collectionIndex].items = storedItems.concat(newItems); 

    return data.store.collections.find(item =>item.routeName===routeName);
}

/* Mutations ***************************************************************** */

const RootMutation = new GraphQLObjectType({
    name: "RootMutation",
    fields: {
        addNewCollection: {
            type: CollectionType,
            args: {
                title: {
                    type: new GraphQLNonNull(GraphQLString),
                    defaultValue: null
                },
                items: {
                    type: new GraphQLNonNull(new GraphQLList(ItemInputType)),
                    defaultValue: null
                }
            },
            resolve: addNewCollection 
        },
        removeCollections: {
            type: GraphQLBoolean,
            args: {
                routeNames: {
                    type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
                    defaultValue: false
                }
            },
            resolve: removeCollections
        },
        addItems: {
            type: CollectionType,
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