import { IconDownload, IconSearch } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { NoResults } from "@/components/common/empty-state";
import { SectionCard, SectionCardSkeleton } from "@/components/common/section-card";
import { PAGE_SIZES, PurchasesTable } from "@/components/purchases/data-table";
import { buttonVariants } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFilters } from "@/hooks/use-filters";
import { publicApiUrl } from "@/lib/api";
import { pickFilters } from "@/lib/filters";
import { purchasesQuery } from "@/lib/queries";

const SORT_PATTERN =
  /^(purchaseId|itemName|category|amountUsd|reviewRating|season|stateName|age):(asc|desc)$/;

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  pageSize: z.coerce
    .number()
    .refine((n) => (PAGE_SIZES as readonly number[]).includes(n))
    .optional()
    .catch(undefined),
  sort: z.string().regex(SORT_PATTERN).optional().catch(undefined),
  q: z.string().max(60).optional().catch(undefined),
});

export const Route = createFileRoute("/compras")({
  staticData: {
    title: "Compras",
    description: "Explorador de compras con filtros, orden y exportación",
  },
  head: () => ({ meta: [{ title: "Compras · Shopping Insights" }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    ...pickFilters(search),
    page: search.page ?? 1,
    pageSize: search.pageSize ?? 20,
    sort: search.sort ?? "purchaseId:asc",
    q: search.q,
  }),
  loader: ({ context: { queryClient }, deps }) => queryClient.ensureQueryData(purchasesQuery(deps)),
  pendingComponent: () => <SectionCardSkeleton height="h-[32rem]" />,
  component: Purchases,
});

function Purchases() {
  const { filters } = useFilters();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const params = {
    ...filters,
    page: search.page ?? 1,
    pageSize: search.pageSize ?? 20,
    sort: search.sort ?? "purchaseId:asc",
    q: search.q,
  };
  // useQuery (no suspense) + datos previos: al paginar la tabla no parpadea.
  const { data, isFetching } = useQuery({
    ...purchasesQuery(params),
    placeholderData: keepPreviousData,
  });

  const [term, setTerm] = useState(search.q ?? "");
  const debounced = useDebouncedValue(term.trim(), 300);
  useEffect(() => {
    if ((search.q ?? "") !== debounced) {
      void navigate({
        search: (prev) => ({ ...prev, q: debounced || undefined, page: undefined }),
        replace: true,
      });
    }
  }, [debounced, search.q, navigate]);

  const exportUrl = publicApiUrl("/api/v1/purchases/export", {
    ...filters,
    q: params.q,
    sort: params.sort,
  });

  return (
    <SectionCard
      title="Compras"
      description="Paginación, orden y búsqueda se resuelven en el servidor"
      action={
        // Enlace semántico (no botón): es una descarga que el navegador maneja de forma nativa.
        <a href={exportUrl} download className={buttonVariants({ variant: "outline" })}>
          <IconDownload data-icon="inline-start" />
          Exportar CSV
        </a>
      }
    >
      <div className="flex flex-col gap-4">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <IconSearch />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Buscar por producto"
            placeholder="Buscar producto (p. ej. Jacket)"
            value={term}
            maxLength={60}
            onChange={(e) => setTerm(e.target.value)}
          />
        </InputGroup>
        {data && data.meta.total === 0 ? (
          <NoResults description="Ninguna compra coincide con la búsqueda y los filtros." />
        ) : data ? (
          <PurchasesTable
            data={data.data}
            meta={data.meta}
            sort={params.sort}
            loading={isFetching}
            onSortChange={(sort) =>
              void navigate({ search: (prev) => ({ ...prev, sort, page: undefined }) })
            }
            onPageChange={(page) => void navigate({ search: (prev) => ({ ...prev, page }) })}
            onPageSizeChange={(pageSize) =>
              void navigate({ search: (prev) => ({ ...prev, pageSize, page: undefined }) })
            }
          />
        ) : null}
      </div>
    </SectionCard>
  );
}
