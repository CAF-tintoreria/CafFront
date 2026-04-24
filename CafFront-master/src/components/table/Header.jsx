import { useMediaQuery } from "@/hooks/use-mobile";
import { NavigateRoute } from "@/lib/NavigateRoute";
import { Link } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";
import { Button } from "../ui/button";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";

export function Header({
  cardTitle,
  cardDescription,
  createButtonText,
  addItemRouteNavigation,
  canCreate,
  process,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const exportXLSX = () => {
    // Encabezados
    const headers = ["ID", "Tipo de proceso", "Observaciones"];

    // Filas desde lo que se ve en pantalla
    const rows = process.map((processItem) => [
      processItem.id,
      processItem.proceso,
      processItem.observacion,
    ]);

    // Armamos hoja con AOAs (arrays de arrays)
    const ws = XLSXUtils.aoa_to_sheet([headers, ...rows]);

    // Ancho de columnas (opcional)
    ws["!cols"] = [
      { wch: 10 }, // ID
      { wch: 12 }, // Tipo
      { wch: 40 }, // Observaciones
    ];

    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Procesos");
    XLSXWriteFile(wb, "Procesos.xlsx");
  };
  return (
    <CardHeader>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <NavigateRoute path="/" />
          <div>
            <CardTitle>{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            className={`${
              isMobile ? "w-9 h-9 p-0" : "flex items-center gap-2"
            } bg-green-800`}
            onClick={exportXLSX}
            aria-label="Exportar a Excel"
            title="Exportar a Excel"
          >
            <Download className="h-4 w-4" />
            {!isMobile && <span>Exportar a excel</span>}
          </Button>

          {canCreate && (
            <Link to={addItemRouteNavigation} className="inline-flex">
              <Button
                className={`${
                  isMobile ? "w-9 h-9 p-0" : "flex items-center gap-2"
                }`}
                aria-label={createButtonText}
                title={createButtonText}
              >
                <Plus className="h-4 w-4" />
                {!isMobile && <span>{createButtonText}</span>}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
