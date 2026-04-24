import { ProcessService } from "@/services/process.service";
import { useState } from "react";

export const useDeleteProcess = () => {
  const [loading, setLoading] = useState(false);

  const deleteProcess = async (id) => {
    setLoading(true);
    try {
      const data = await ProcessService.delete(id);
      return data;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteProcess,
  };
};
