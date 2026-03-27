import { httpClient } from "../config/AxioisHelper";

 export const createRoomApi = async (roomDetail) => {
    const response = await httpClient.post(`api/v1/rooms`,roomDetail)
    console.log(response)
    return response.data;
};

 export const joinRoomApi = async(roomId) => {
    const response = await httpClient.get(`api/v1/${roomId}`)
    console.log(response);
    return response.data;
}

export const getMessageApi = async(roomId,size=50,page=0)=> {

    const response = await httpClient.get(`api/v1/${roomId}/messages?size=${size}&page=${page}`);
    console.log(response.data);
    return response.data;
}

