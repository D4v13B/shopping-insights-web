import { IconFilterSearch } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useFilters } from "@/hooks/use-filters";

export function NoResults({ description = "Ninguna compra coincide con los filtros elegidos." }) {
  const { clearFilters } = useFilters();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFilterSearch />
        </EmptyMedia>
        <EmptyTitle>Sin resultados</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      </EmptyContent>
    </Empty>
  );
}
