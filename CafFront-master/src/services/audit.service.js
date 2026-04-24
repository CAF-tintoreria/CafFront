import { api } from "@/lib/axios";

const unwrap = (res) => {
  const { ok, data, page, pageSize, total, message } = res.data ?? {};
  if (ok === false) throw new Error(message || "No se pudo obtener auditoría");
  return { data, page, pageSize, total };
};

export const AuditService = {
  async list(params) {
    const res = await api.get("/audit", { params });
    return unwrap(res);
  },
};
