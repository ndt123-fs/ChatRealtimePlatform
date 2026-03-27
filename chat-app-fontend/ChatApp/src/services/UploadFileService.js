import { httpClient } from "../config/AxioisHelper";


export const uploadFileApi = async (file, folder) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await httpClient.post("api/v1/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const updateAvatarApi = async (avatarUrl) => {
  const response = await httpClient.put("api/v1/files/avatar", {
    avatar: avatarUrl,
  });
  return response.data;
};