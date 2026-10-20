import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

/** Error boundary por ruta: explica el problema y permite reintentar sin recargar la página. */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  const detail =
    error instanceof ApiError
      ? (error.problem?.detail ?? error.message)
      : "Ocurrió un error inesperado al cargar esta vista.";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-10">
      <Alert variant="destructive">
        <IconAlertTriangle />
        <AlertTitle>No se pudo cargar la información</AlertTitle>
        <AlertDescription>
          <p>{detail}</p>
          {error instanceof ApiError && error.problem?.requestId ? (
            <p className="text-muted-foreground">Referencia: {error.problem.requestId}</p>
          ) : null}
        </AlertDescription>
      </Alert>
      <div>
        <Button
          variant="outline"
          onClick={() => {
            reset();
            void router.invalidate();
          }}
        >
          <IconRefresh data-icon="inline-start" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}
