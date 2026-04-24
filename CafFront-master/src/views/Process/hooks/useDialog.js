import { useState } from "react";

export const useDialog = () => {
  const [showDialog, setShowDialog] = useState(false);
  const onOpenChange = (visible) => setShowDialog(visible);

  return {
    showDialog,
    onOpenChange,
  };
};
