import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useCreateProcess } from "./hooks/useCreateProcess";
import { showToast } from "@/lib/Toast";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { processSchema } from "./constants/schema";

export function CreateProcess() {
  const form = useForm({
    resolver: zodResolver(processSchema),
    defaultValues: {
      typeProcess: "",
      observations: "",
    },
  });

  const { createProcess } = useCreateProcess();

  const onSubmit = async (formValues) => {
    const result = await createProcess(formValues);
    console.log(result);
    if (result.ok) {
      showToast({
        title: "Creación éxitosa",
      });
      form.reset(form.control._defaultValues);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <NavigateRoute path="/procesos" />
            <div>
              <CardTitle>Crear Proceso</CardTitle>
              <CardDescription>
                Completa los datos para crear un nuevo proceso
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="typeProcess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de proceso *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Proceso" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observación</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Ingrese la observación"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex gap-4">
              <Link to="/procesos" className="inline-flex flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Creando..." : "Crear proceso"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
