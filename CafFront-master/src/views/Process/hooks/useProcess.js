import { ProcessService } from "@/services/process.service";
import { useState } from "react";
import { useEffect } from "react";

export function useProcess() {
  const [loading, setloading] = useState(false);
  const [process, setProcess] = useState([]);

  async function fetchData() {
    setloading(true);
    try {
      const data = await ProcessService.list();
      setProcess(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  }
  const refetch = () => {
    fetchData();
  };
  useEffect(() => {
    fetchData();
  }, []);

  return {
    process,
    loading,
    refetch,
  };
}
