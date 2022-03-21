import { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull, GraphQLID, GraphQLError } from "graphql";
import data from '../data/store.json' assert { type: 'json' };
import { StoreInputType, CollectionInputType, ItemInputType, ReturnType } from "./types.js";
/* ****************************** Models ****************************** */
import StoreModel from "../models/storeModel.js"

/* Resolvers ******************************************************************* */
const addNewStores = async (parent, args)=>{

    const failed = [];
    const successed = []
    const additionalInfoArr = []

    const inputedStores = args.stores;
    await Promise.allSettled(
        inputedStores.map(
            async ({name, location, collections})=>{
                return new StoreModel({name, location, collections }).save()
            }
        )
    ).then(fulfilled=>{
        fulfilled.forEach(saving=>{
            saving.status === 'fulfilled' ?
            successed.push(saving.value.name) : 
            (()=>{
                failed.push(saving.reason.keyValue.name);
                additionalInfoArr.push(`[11000]: STORE WITH NAME [${saving.reason.keyValue.name.toUpperCase()}] EXIST`);
            })();
        })
    }).catch(err=>{
        console.log(err);
    })

    let additionalInfo = "";
    additionalInfo = additionalInfoArr.reduce((prev, curr)=>prev+=(curr+" || "),"")

    return {
        all: failed.concat(successed),
        successed,
        failed,
        additionalInfo
    }
}


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
        additionalInfo: failed.length>0 ? "Existed collection(s) failed in adding proccess." : null
    }

}

const removeCollections = (parent, args)=>{
    const {routeNames} = args;

    const failed = [];
    const successed = [];

    let collections = data.store.collections;

    routeNames.forEach((routeName)=>{       
        routeName = routeName.toLowerCase();

        const collectionIndex = collections.findIndex((collection)=> collection.routeName===routeName);
        
        if(collectionIndex===-1){
            failed.push(routeName);
            return;
        }
        
        successed.push(routeName);
        collections = collections.slice(0,collectionIndex).concat(collections.slice(collectionIndex+1, collections.length));
    });
    
    data.store.collections = collections;

    return {
        all: failed.concat(successed),
        successed,
        failed,
        additionalInfo: failed.length>0 ? "Non-existed collection(s) failed in removing proccess." : null
    }
}

const addItems = (parent, args)=>{
    const routeName = args.routeName.toLowerCase();

    const collectionIndex = data.store.collections.findIndex(item=>item.routeName===routeName)
    if(collectionIndex === -1){
        throw Error({
            errCode: "444",
            errMessage: "Collection not found",
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
        additionalInfo: failed.length>0 ? "Existed item(s) failed in adding proccess" : null
    }
}

const removeItems = (parent, args)=>{
    const {routeName, itemsId} = args;

    const collectionIndex = data.store.collections.findIndex(item =>item.routeName===routeName.toLowerCase())
    if(collectionIndex === -1){
        throw Error({
            errCode: "444",
            errMessage: "collection not found",
        });
    }

    const failed = [];
    const successed = [];


    let storedItems = data.store.collections[collectionIndex].items;
    
    outer: 
    for(let i=0;i<itemsId.length;i++){
        for(let j=0;j<storedItems.length;j++){
            if(itemsId[i] === storedItems[j].id){
                storedItems = storedItems.slice(0, j).concat(storedItems.slice(j+1, storedItems.length));
                successed.push(itemsId[i]);
                continue outer;
            }
        }
        failed.push(itemsId[i]);
    }

    data.store.collections[collectionIndex].items = storedItems;

    return {
        all: failed.concat(successed),
        successed,
        failed,
        additionalInfo: failed.length>0 ? "Non-existed item(s) failed in removing proccess." : null
    }
}

/* Mutations ***************************************************************** */

const RootMutation = new GraphQLObjectType({
    name: "RootMutation",
    fields: {
        addNewStores:{
            type: ReturnType,
            args: {
                stores:{
                    type: new GraphQLNonNull(new GraphQLList(StoreInputType))
                }
            },
            resolve: addNewStores
        },
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
        removeItems: {
            type: ReturnType,
            args: {
                routeName: {
                    type: new GraphQLNonNull(GraphQLString),
                    defaultValue: null
                },
                itemsId: {
                    type: new GraphQLNonNull(new GraphQLList(GraphQLID)),
                    defaultValue: null
                }
            },
            resolve: removeItems 
        },
    }
});


export default RootMutation