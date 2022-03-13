import { GraphQLObjectType, GraphQLList, GraphQLID } from "graphql";
import data from '../data/store.json' assert { type: 'json' };
import { CollectionType } from "./types.js";


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        collections: {
            type: new GraphQLList(CollectionType),
            resolve: (parent, args) => (
                data.store.collections
            )
        },
        
        collection: {
            type: CollectionType,
            args: {
                routeName: {
                    type: GraphQLID
                }
            },
            resolve: (parent, args) => (
                data.store.collections.find(collection => collection.routeName.toLowerCase === args.routeName.toLowerCase) 
            )         
        }
        
    }
})

export default RootQuery;