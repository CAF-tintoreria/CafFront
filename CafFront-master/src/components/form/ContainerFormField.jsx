import React from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";

const ContainerFormField = ({ label, children }) => {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default ContainerFormField;