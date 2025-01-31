import { Collection, ObjectId } from "mongodb";
import { APIPhone, APITime, APIWeather, LongLat, RestauranteModel } from "./types.ts";
import { GraphQLError } from "graphql";

type Context ={
    restauranteCollection:Collection<RestauranteModel>
}
type argsAddRestaurant ={
    name:string,
    direccion:string,
    ciudad:string,
    telefono:string,
}
type argsGetRestaurant ={
    id:string,
}
export const resolvers = {
    Query:{
        getRestaurants:async(
            _:unknown,
            __:unknown,
            ctx:Context,
        ):Promise<RestauranteModel[]> =>{
            const restaurantes = await ctx.restauranteCollection.find().toArray();
            return restaurantes;

        },
        getRestaurant:async(
            _:unknown,
            args:argsGetRestaurant,
            ctx:Context,
        ):Promise<RestauranteModel|null> =>{
            const {id} = args;
            const restaurantId = await ctx.restauranteCollection.findOne({_id:new ObjectId(id)});
            if(!restaurantId) throw new GraphQLError("no existe");
            return restaurantId;
        }
    },
    Mutation:{
        addRestaurant:async(
            _:unknown,
            args:argsAddRestaurant,
            ctx:Context,
        ):Promise<RestauranteModel> =>{
            const{name,direccion,ciudad,telefono} = args;
            if(!name || !direccion || !ciudad || !telefono) throw new GraphQLError("faltan parametros por escribir");
            //restaurante con mismo nombre
            const restauranteExists = await ctx.restauranteCollection.countDocuments({telefono:telefono});
            if(restauranteExists>=1) throw new GraphQLError("Este restaurante ya existe");
            const API_KEY = "hd5cu6NU54+E6VtZzcICQA==L5c4S4Zt6m2ugF4g";
            const url = `https://api.api-ninjas.com/v1/validatephone?number=${telefono}`;
            const datos =await fetch(url,{
                headers:{
                    "X-Api-Key":API_KEY
                }
            });
            if(datos.status !== 200) throw new GraphQLError("no se ha podido conectar con la API telefono");
            const resultado:APIPhone =await datos.json();//obtengo datos
            if(!resultado.is_valid) throw new GraphQLError("El telefono no es valido");
            const {insertedId} = await ctx.restauranteCollection.insertOne({
                name,
                direccion,
                ciudad,
                telefono,
            });
            return {
                _id:insertedId,
                name,
                direccion,
                ciudad,
                telefono,
                
            };
        },
        deleteRestaurant:async(
            _:unknown,
            args:argsGetRestaurant,
            ctx:Context,
        ):Promise<boolean> =>{
            const {id} = args;            
            const {deletedCount} = await ctx.restauranteCollection.deleteOne({_id:new ObjectId(id)});
            if (deletedCount == 0) return false;
            return true;
        }
    }, 
    Restaurant:{
        id:(parent:RestauranteModel) => parent._id!.toString(),
        hora:async(
            parent:RestauranteModel
        ):Promise<string> =>{
            const API_KEY = "hd5cu6NU54+E6VtZzcICQA==L5c4S4Zt6m2ugF4g";
            const telefono = parent.telefono;
            const url = `https://api.api-ninjas.com/v1/validatephone?number=${telefono}`;
            const datos =await fetch(url,{
                headers:{
                    "X-Api-Key":API_KEY
                }
            });
            if(datos.status !== 200) throw new GraphQLError("no se ha podido conectar con la API telefono");
            const resultado:APIPhone =await datos.json();//obtengo datos
            if(!resultado.is_valid) throw new GraphQLError("El telefono no es valido");
            const timezone = resultado.timezones[0];
            const city =parent.ciudad;
            //const urlTime =`https://api.api-ninjas.com/v1/worldtime?city=${timezone}`;
            const urlTime =`https://api.api-ninjas.com/v1/city?name=${city}`;
            const datosLat =await fetch(urlTime,{
                headers:{
                    "X-Api-Key":API_KEY
                }
            });
            if(datosLat.status !== 200) throw new GraphQLError("no se ha podido conectar con la API tiempo");
            const latlong:LongLat = await datosLat.json();
            const latitud = latlong.latitude;
            const longitude = latlong.longitude;
            const urlTimer =`https://api.api-ninjas.com/v1/worldtime?lat=${latitud}lon=${longitude})`;
            const datosTime=await fetch(urlTimer,{
                headers:{
                    "X-Api-Key":API_KEY
                }
            });
            if(datosTime.status !== 200) throw new GraphQLError("no se ha podido conectar con la API tiempo");
            const timeVar:APITime = await datosTime.json();
            const time = timeVar.hour;
            const minute = timeVar.minute;
            const hora = time+":"+minute;
            return hora;
        },
        temp:async(
            parent:RestauranteModel,
        ):Promise<number> =>
        {
            const ciudad =parent.ciudad;
            const API_KEY = "hd5cu6NU54+E6VtZzcICQA==L5c4S4Zt6m2ugF4g";
            const urlTemp =`https://api.api-ninjas.com/v1/city?name=${ciudad}`;
            const datosTemp =await fetch(urlTemp,{
                headers:{
                    "X-Api-Key":API_KEY
                }
            });
            console.log(datosTemp.status);
            if(datosTemp.status !== 200) throw new GraphQLError("no se ha podido conectar con la API temperatura1");
            const temperaturaVar:APIWeather = await datosTemp.json();
            const temp  = temperaturaVar.temp;
            return 0;
        },

    },
}