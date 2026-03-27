import { httpClient } from "../config/AxioisHelper";
 export const createLogin = async (user) => {
    const response = await httpClient.post(`api/v1/auth/login`,user)
    console.log(response)
    return response.data;
};