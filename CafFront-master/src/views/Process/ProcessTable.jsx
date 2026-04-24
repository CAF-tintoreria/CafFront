import { SearchInput } from "@/components/table/filters/search/SearchInput";
import { Header } from "@/components/table/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useMediaQuery } from "@/hooks/use-mobile";
import { showToast } from "@/lib/Toast";
import { useState } from "react";
import { ConfirmDeleteProcess } from "./components/dialog/ConfirmDeleteProcess";
import { EditProcess } from "./components/dialog/EditProcess";
import { useDeleteProcess } from "./hooks/useDeleteProcess";
import { useDialog } from "./hooks/useDialog";
import { useNormalizedProcess } from "./hooks/useNormalizedProcess";
import { usePermissions } from "./hooks/usePermissions";
import { useProcess } from "./hooks/useProcess";
import { ProcessDesktopTable } from "./ProcessDesktopTable";
import { ProcessMobileTable } from "./ProcessMobileTable";

export function ProcessTable() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { showDialog, onOpenChange } = useDialog();
  const { showDialog: showEditDialog, onOpenChange: onOpenEditChange } =
    useDialog();

  const [searchValue, setSearchValue] = useState("");

  const [processSelected, setProcessSelected] = useState();

  const { loading, process, refetch } = useProcess();
  const { loading: deleting, deleteProcess } = useDeleteProcess();
  const { canCreate, canDelete, canEdit } = usePermissions();
  const { filteredAndSortedProcess } = useNormalizedProcess(
    process,
    searchValue
  );

  const onEditProcess = (process) => {
    setProcessSelected(process);
    onOpenEditChange(true);
  };

  const onDeleteProcess = (process) => {
    setProcessSelected(process);
    onOpenChange(true);
  };
  const onSearch = (value) => setSearchValue(value);

  const confirmDeleteProcess = async (id) => {
    const result = await deleteProcess(id);

    if (result.ok) {
      process.filter((proccesItem) => proccesItem.processID !== id);
      onOpenChange(false);
      showToast({
        title: "Eliminación realizada con éxito",
      });
      refetch();
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <Header
          cardTitle={"Gestión de procesos"}
          cardDescription={"Administrar los procesos del sistema"}
          createButtonText={"Alta proceso"}
          addItemRouteNavigation={"/procesos/crear"}
          canCreate={canCreate}
          process={filteredAndSortedProcess}
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2  gap-4 ">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <SearchInput
                  searchValue={searchValue}
                  onSearch={onSearch}
                  placeholder={"Tipo de proceso..."}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  onSearch("");
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner className="size-6 text-purple-500" />
              </div>
            ) : isMobile ? (
              <ProcessMobileTable
                showEditDialog={onEditProcess}
                process={filteredAndSortedProcess}
                canDelete={canDelete}
                canEdit={canEdit}
                onDelete={onDeleteProcess}
              />
            ) : (
              <ProcessDesktopTable
                showEditDialog={onEditProcess}
                onDelete={onDeleteProcess}
                canDelete={canDelete}
                canEdit={canEdit}
                process={filteredAndSortedProcess}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <ConfirmDeleteProcess
        showDialog={showDialog}
        processSelected={processSelected}
        deleting={deleting}
        onOpenChange={onOpenChange}
        confirmDeleteProcess={confirmDeleteProcess}
      />
      {processSelected && showEditDialog && (
        <EditProcess
          onOpenChange={onOpenEditChange}
          showDialog={showEditDialog}
          process={processSelected}
          refetch={refetch}
        />
      )}
    </div>
  );
}
