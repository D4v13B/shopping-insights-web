/** Suma ingresos y órdenes de los estados por región y calcula la participación. */
export function regionTotals(states: { region: string; revenue: number; orders: number }[]) {
  const totals = new Map<string, { revenue: number; orders: number }>();
  for (const s of states) {
    const t = totals.get(s.region) ?? { revenue: 0, orders: 0 };
    totals.set(s.region, { revenue: t.revenue + s.revenue, orders: t.orders + s.orders });
  }
  const grand = [...totals.values()].reduce((sum, t) => sum + t.revenue, 0);
  return [...totals.entries()]
    .map(([region, t]) => ({ region, ...t, sharePct: grand ? (t.revenue / grand) * 100 : 0 }))
    .sort((a, b) => b.revenue - a.revenue);
}
