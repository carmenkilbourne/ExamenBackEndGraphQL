export const schema = `#graphql
type Restaurant{
    id:ID!
    name:String!
    direccion:String!
    telefono:String!
    ciudad:String!
    temp:Int!
    hora:String!
}
type Query{
    getRestaurants:[Restaurant!]!
    getRestaurant(id:ID!):[Restaurant!]!
}
type Mutation{
    addRestaurant(name:String!,direccion:String!, ciudad:String!,telefono:String!):Restaurant
    deleteRestaurant(id:ID!):Boolean
}
`