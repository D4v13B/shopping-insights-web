import { IconMapOff } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconMapOff />
        </EmptyMedia>
        <EmptyTitle>Página no encontrada</EmptyTitle>
        <EmptyDescription>
          La dirección no corresponde a ninguna vista del dashboard.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/" className={buttonVariants()}>
          Volver al resumen
        </Link>
      </EmptyContent>
    </Empty>
  );
}
