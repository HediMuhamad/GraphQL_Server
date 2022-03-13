import { GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLString, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLInputObjectType, GraphQLBoolean } from "graphql";

const ItemDefs = (name)=>({
    name: name,
    fields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        price: { type: GraphQLInt },
        imageUrl: { type: GraphQLString },
    }
});

const CollectionDefs = (CollTypeName) => ({
    name: CollTypeName,
    fields: {
        title: { type: GraphQLString },
        routeName: { type: GraphQLString },
        items: {
            type: new GraphQLList(ItemType),
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

export const ItemType = new GraphQLObjectType(ItemDefs("item"));
export const ItemInputType = new GraphQLInputObjectType(ItemDefs("item_input"));
export const CollectionType = new GraphQLObjectType(CollectionDefs("collection"));
