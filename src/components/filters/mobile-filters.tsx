import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useFilters } from "@/hooks/use-filters";
import { countActiveFilters } from "@/lib/filters";
import { FilterBar } from "./filter-bar";

/** En pantallas chicas los filtros van en un panel lateral para no ocupar toda la vista. */
export function MobileFilters() {
  const { filters } = useFilters();
  const active = countActiveFilters(filters);
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        <IconAdjustmentsHorizontal data-icon="inline-start" />
        Filtros
        {active ? <Badge>{active}</Badge> : null}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Se aplican a todas las vistas y quedan en la URL.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <FilterBar stacked />
        </div>
      </SheetContent>
    </Sheet>
  );
}
