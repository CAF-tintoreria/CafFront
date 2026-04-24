import { ProcessService } from "@/services/process.service";
import { useState } from "react";

export const useCreateProcess = () => {
  const [loading, setLoading] = useState(false);

  const createProcess = async (body) => {
    setLoading(true);
    try {
      const response = await ProcessService.create(body);

      return response;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createProcess,
  };
};
