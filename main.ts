// deno-lint-ignore-file require-await
import { ApolloServer } from "@apollo/server";
import { schema } from "./schema.ts";
import { MongoClient } from "mongodb";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";
import { RestauranteModel } from "./types.ts";

const MONGO_URL = "mongodb+srv://ckilbourne:12345@nebrija-cluster.cumaf.mongodb.net/?retryWrites=true&w=majority&appName=Nebrija-Cluster";
if (!MONGO_URL) {
  throw new Error("Please provide a MONGO_URL");
}
const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Connected to MongoDB");

const client = new MongoClient(MONGO_URL);
const db = client.db("ExamenGQL");
const restauranteCollection = db.collection<RestauranteModel>("restaurante");


const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
 context: async () =>  ({ restauranteCollection}),
});


console.info(`Server escuchando en ${url}`);