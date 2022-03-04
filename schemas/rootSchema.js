import { GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLString, GraphQLID, GraphQLInt } from "graphql";

const RootQuery = new GraphQLObjectType({
    name: "RootQuerType",
    fields: {
        status: {
            type: GraphQLString,
            resolve(parent, args){
                return "It's Work"
            }
        }
    }
});


export default new GraphQLSchema({
    query: RootQuery
});