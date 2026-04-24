// src/services/garments.service.js
import { api } from "@/lib/axios";

const unwrap = (res) => {
  const { ok, data, message } = res.data ?? {};
  if (ok === false) throw new Error(message || "Operación no realizada");
  return { data, message };
};

export const PrendasService = {
  // Listado: usar "complete" para traer cliente/muestra anidados
  async list() {
    const url = "/prenda/complete"
    const res = await api.get(url);
    return unwrap(res);
  },

  async getById(id) {
    const url = `/prenda/${id}/complete`;
    const res = await api.get(url);
    return unwrap(res);
  },

  async create(dto) {
    // dto debe respetar el DTO del backend: PrendaCreateDto
    // { tipoPrenda, nroCorte, cantidadUnidades, pesoKilos, cantidadBolsas,
    //   fechaIngreso, remito?, estadoPrendaID, procesoID, clienteID, muestraID?, observaciones? }
    const res = await api.post("/prenda", dto);
    return unwrap(res);
  },

  async update(id, dto) {
    const res = await api.put(`/prenda/${id}`, dto);
    return unwrap(res);
  },

  async remove(id) {
    const res = await api.delete(`/prenda/${id}`);
    const { ok, message, data } = res?.data ?? {};
    if (ok === false) throw new Error(message || "");
    return { data, message: message || "Prenda eliminada correctamente." };
  },

  // Estado puntual de una prenda
  async getEstado(id) {
    const res = await api.get(`/prenda/${id}/estado`);
    return unwrap(res); // -> { data: { estadoPrendaID } }
  },

  async updateEstado(id, estadoPrendaID) {
    const res = await api.patch(`/prenda/${id}/estado`, { estadoPrendaID });
    return unwrap(res); // message del backend
  },

  // Catálogos (si ya tenés estos endpoints en backend)
  async listEstados() {
    const res = await api.get("/estado-prenda");
    return unwrap(res); // -> [{ estadoPrendaID, estadoActual }]
  },

  async listProcesos() {
    const res = await api.get("/process/options");
    return unwrap(res); // -> [{ procesoID, nombre }]
  },
};
