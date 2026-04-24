import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Adjunta token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const mapAxiosError = (error) => {
  // Permite override por request
  const customMsg = error?.config?.meta?.errorMessage;

  // 1) Timeout
  if (error?.code === "ECONNABORTED") {
    return new Error(
      customMsg ||
        "El servidor tardó en responder. Probá de nuevo en unos segundos."
    );
  }

  // 2) No hubo respuesta del servidor (down, red, CORS)
  if (!error?.response) {
    return new Error(
      customMsg ||
        "No pudimos conectar con el servidor. Verificá tu conexión e intentá nuevamente."
    );
  }

  // 3) Tenemos respuesta HTTP
  const { status, data } = error.response;

  // 3.a) 401: token inválido/expirado
  if (status === 401) {
    localStorage.removeItem("token");
    return new Error(
      customMsg || data?.message || "Sesión expirada. Iniciá sesión otra vez."
    );
  }

  // 3.b) 408/5xx: servidor ocupado/caído
  if (status === 408 || (status >= 500 && status <= 599)) {
    return new Error(
      customMsg ||
        "El servicio está temporalmente no disponible. Intentá nuevamente en breve."
    );
  }

  // 3.c) Otros 4xx con mensaje del backend
  const backendMsg =
    data?.message || data?.error || data?.title || error.message;

  return new Error(
    customMsg || backendMsg || "Ocurrió un error. Intentá nuevamente."
  );
};

// Interceptor de respuesta
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(mapAxiosError(error))
);
