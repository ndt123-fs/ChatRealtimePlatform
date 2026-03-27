import { httpClient
    
 } from "../config/AxioisHelper";

 export const createUserApi = async (user) => {
    const response = await httpClient.post(`api/v1/users`,user)
    console.log(response);
    return response.data;
 }