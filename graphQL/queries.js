import { GraphQLObjectType, GraphQLList, GraphQLString } from "graphql";
import { CollectionType, ItemType, StoreType } from "./types.js";
/* ********************** Models ********************** */
import createModel from "../models/generalCollectionsModelGenerator.js"

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        stores: {
            type: new GraphQLList(StoreType),
            resolve: async ()=>{
                const storesModel = createModel("stores");
                const stores = await storesModel.find({})
                return stores
            }
        },
        store: {
            type: StoreType,
            args: {
                store_name: {
                    type: GraphQLString
                }
            },
            resolve: async (_, args)=>{
                const {store_name} = args;
                const storeModel = createModel("stores");
                const store = await storeModel.findOne({name: store_name});
                return store;
            }
        },
        collections: {
            type: new GraphQLList(CollectionType),
            args: {
                path: {
                    type: GraphQLString,
                    description: "Hint: STORE_NAME"
                }
            },
            resolve: async (_, args) => {
                const storesModel = createModel("stores");
                const stores = await storesModel.findOne({name: args.path})


                const collections = await Promise.all(stores.collections.map(async (collection)=> createModel(collection).find({})))

                const graphQLCollectionDef = (title, routeName, items) => ({
                    title,
                    routeName,
                    items
                })

                return collections.map((items)=>{
                    const metaDataIndex = items.findIndex((item)=>item.is_metadata===true); 
                    const name  = items[metaDataIndex].name
                    const title = name[0].toUpperCase() + name.slice(1);
                    const realItems = items.slice(0,metaDataIndex).concat(items.slice(metaDataIndex+1, items.length));
                    return graphQLCollectionDef(title, name, realItems);
                })
            }
        },
        collection: {
            type: CollectionType,
            args: {
                path: {
                    type: GraphQLString,
                    description: "Hint: STORE_NAME.COLLECTION_NAME"
                }
            },
            resolve: async (_, args) => {
                const [store_name, collection_name] = args.path.split(".");
                const path = `${collection_name}.${store_name}`

                const collection = await createModel(path).find();

                const graphQLCollectionDef = (title, routeName, items) => ({
                    title,
                    routeName,
                    items
                })

                const metaDataIndex = collection.findIndex((item)=>item.is_metadata===true); 
                const name = collection[metaDataIndex].name
                const title = name[0].toUpperCase() + name.slice(1);
                const items = collection.slice(0,metaDataIndex).concat(collection.slice(metaDataIndex+1, collection.length));
                return graphQLCollectionDef(title, name, items);
            }
        },
        items: {
            type: new GraphQLList(ItemType),
            args: {
                path: {
                    type: GraphQLString,
                    description: "Hint: STORE_NAME.COLLECTION_NAME"
                }
            },
            resolve: async (_, args) => {
                const [store_name, collection_name] = args.path.split(".");
                const path = `${collection_name}.${store_name}`

                const collection = await createModel(path).find();

                const metaDataIndex = collection.findIndex((item)=>item.is_metadata===true); 
                const items = collection.slice(0,metaDataIndex).concat(collection.slice(metaDataIndex+1, collection.length));
                return items;
            }
        },
        item: {
            type: ItemType,
            args: {
                path: {
                    type: GraphQLString,
                    description: "Hint: STORE_NAME.COLLECTION_NAME.ITEM_ID"
                }
            },
            resolve: async (_, args) => {
                const [store_name, collection_name, item_id] = args.path.split(".");
                const path = `${collection_name}.${store_name}`

                const item = await createModel(path).findOne({_id: item_id});
                
                return item.is_metadata===true ? null : item;
            }
        }
    }
})

export default RootQuery;