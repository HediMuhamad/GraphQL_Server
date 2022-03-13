import { GraphQLSchema } from "graphql";
import RootMutation from "./mutations.js";
import RootQuery from "./queries.js";

export default new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});