import { OptionalId } from "mongodb";

export type RestauranteModel =OptionalId<{
    name:string;
    direccion:string;
    ciudad:string;
    telefono:string;
}>
export type APIPhone={
    country:string;
    is_valid:boolean;
    timezones:string[];
}

export type APIWeather ={
    temp:number;
}
export type APITime = {
    hour:string;
    minute:string;
}

export type LongLat = {
    latitude: number;
    longitude: number;
}