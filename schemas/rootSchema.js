import { GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLString, GraphQLID, GraphQLInt } from "graphql";
import _ from "lodash"; 
import data from '../data/store.json' assert { type: 'json' };

const ItemsType = new GraphQLObjectType({
    name: 'items',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        price: { type: GraphQLInt },
        imageUrl: { type: GraphQLString },
    }
});

const CollectionType = new GraphQLObjectType({
    name: 'collection',
    fields: {
        title: { type: GraphQLString },
        routeName: { type: GraphQLString },
        items: {
            type: new GraphQLList(ItemsType),
            args: {
                size:{
                    type: GraphQLInt,
                    description: "The number of items you need to get, use (-1) to get all we have.",
                    defaultValue: -1,
                }
            },
            resolve(parent, args){ 
                args.size = args.size==-1 ? parent.items.length : args.size;
                return parent.items.slice(0, args.size);  
            }
        },
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        collections: {
            type: new GraphQLList(CollectionType),
            resolve(parent, args){
                return data.store.collections;
            }
        },
        
        collection: {
            type: CollectionType,
            args: {
                routeName: {
                    type: GraphQLID
                }
            },
            resolve(parent, args){
                return _.find(data.store.collections, function(o){ return o.routeName.toLowerCase === args.routeName.toLowerCase });           
            }
        }
        
    }
})

export default new GraphQLSchema({
    query: RootQuery
});