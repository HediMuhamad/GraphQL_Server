import { GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLString, GraphQLID, GraphQLInt } from "graphql";
import _ from "lodash"; 
import data from '../data/store.json' assert { type: 'json' };

const ItemsType = new GraphQLObjectType({
    name: 'items',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        price: { type: GraphQLInt },
        imageUrl: { type: GraphQLString }
    }
});

const CollectionType = new GraphQLObjectType({
    name: 'collection',
    fields: {
        title: { type: GraphQLString },
        routeName: { type: GraphQLString },
        items: { type: new GraphQLList(ItemsType) },
    }
});

const CollectionsType = new GraphQLObjectType({
    name: 'collections',
    fields: {
        collection: { 
            type: new GraphQLList(CollectionType),
            resolve(parent, args){
                console.log("CollectionsType: ");
            }        
        }
    }
});

const StoreType = new GraphQLObjectType({
    name: 'store',
    fields: {
        collections: { type: CollectionsType, }
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        store: {
            type: StoreType,
            resolve(parent, args){
                console.log(parent);
                return data.store;
            }
        },
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