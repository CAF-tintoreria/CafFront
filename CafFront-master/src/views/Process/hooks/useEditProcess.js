import { ProcessService } from "@/services/process.service";
import { useState } from "react";

export const useEditProcess = () => {
  const [loading, setLoading] = useState(false);

  const editProcess = async (id, body) => {
    setLoading(true);
    try {
      const response = await ProcessService.update(id, body);

      return response;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    editProcess,
  };
};
