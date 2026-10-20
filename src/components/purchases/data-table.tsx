import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Purchase } from "@/contract";
import { formatInteger } from "@/lib/format";
import { cn } from "@/lib/utils";
import { purchaseColumns, SORTABLE } from "./columns";

export const PAGE_SIZES = [10, 20, 50, 100] as const;

interface Meta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataTableProps {
  data: Purchase[];
  meta: Meta;
  sort: string;
  loading?: boolean;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function toSortingState(sort: string): SortingState {
  const [id, direction] = sort.split(":");
  return id ? [{ id, desc: direction === "desc" }] : [];
}

/** Ciclo de orden de una columna: asc → desc → orden por defecto (ID asc). */
export function nextSort(current: string, column: string): string {
  const [id, direction] = current.split(":");
  if (id !== column) return `${column}:asc`;
  if (direction === "asc") return `${column}:desc`;
  return "purchaseId:asc";
}

/** Tabla en modo manual: la paginación y el orden los resuelve la API, no el navegador. */
export function PurchasesTable({
  data,
  meta,
  sort,
  loading,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns: purchaseColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: meta.totalPages,
    state: {
      sorting: toSortingState(sort),
      pagination: { pageIndex: meta.page - 1, pageSize: meta.pageSize },
    },
  });

  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn("rounded-md border transition-opacity", loading && "opacity-60")}
        aria-busy={loading}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sortable = SORTABLE.has(header.column.id);
                  const sorted = header.column.getIsSorted();
                  const align = header.column.columnDef.meta?.align;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(align === "right" && "text-right")}
                      aria-sort={
                        sorted ? (sorted === "desc" ? "descending" : "ascending") : undefined
                      }
                    >
                      {sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-2"
                          onClick={() => onSortChange(nextSort(sort, header.column.id))}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <IconArrowUp data-icon="inline-end" />
                          ) : sorted === "desc" ? (
                            <IconArrowDown data-icon="inline-end" />
                          ) : (
                            <IconArrowsSort
                              data-icon="inline-end"
                              className="text-muted-foreground"
                            />
                          )}
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(cell.column.columnDef.meta?.align === "right" && "text-right")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground tabular-nums" aria-live="polite">
          {formatInteger(from)}–{formatInteger(to)} de {formatInteger(meta.total)} compras
        </p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Filas por página</span>
          <Select
            items={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
            value={String(meta.pageSize)}
            onValueChange={(v) => v && onPageSizeChange(Number(v))}
          >
            <SelectTrigger size="sm" aria-label="Filas por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAGE_SIZES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página anterior"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            <IconChevronLeft />
          </Button>
          <span className="tabular-nums">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página siguiente"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            <IconChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
