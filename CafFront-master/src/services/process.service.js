import { api } from "@/lib/axios";

export const ProcessService = {
  async list() {
    const response = await api.get("/process");
    return response.data;
  },
  async create(body) {
    const response = await api.post("/process", body);

    return response.data;
  },

  async delete(id) {
    const response = await api.delete("/process/" + id);

    return response.data;
  },
  async update(id, body) {
    const response = await api.put("/process/" + id, body);

    return response.data;
  },
};
