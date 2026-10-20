import {
  IconChartBar,
  IconDatabaseSearch,
  IconLayoutDashboard,
  IconMap2,
  IconShoppingBag,
  IconUsers,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  { to: "/", label: "Resumen", icon: IconLayoutDashboard },
  { to: "/productos", label: "Productos", icon: IconChartBar },
  { to: "/clientes", label: "Clientes", icon: IconUsers },
  { to: "/geografia", label: "Geografía", icon: IconMap2 },
  { to: "/compras", label: "Compras", icon: IconShoppingBag },
  { to: "/calidad", label: "Calidad de datos", icon: IconDatabaseSearch },
] as const;
