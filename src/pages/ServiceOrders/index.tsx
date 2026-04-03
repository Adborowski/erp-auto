import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useServiceOrders } from "@/context/ServiceOrdersContext";
import type { ServiceOrderStatus } from "@/data/types";
import {
  formatDate,
  calcOrderTotal,
  formatCurrency,
  STATUS_CONFIG,
  STATUS_STEPS,
} from "@/lib/utils";
import { StatusBadge, PriorityBadge } from "@/components/domain/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUp, ArrowDown, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL = "all";
type Filter = ServiceOrderStatus | typeof ALL;
type SortKey = "order" | "created" | "status" | "priority" | "total";
type SortDir = "asc" | "desc";

const PRIORITY_RANK: Record<string, number> = {
  low: 0,
  normal: 1,
  high: 2,
  urgent: 3,
};

function SortHead({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <TableHead className={cn("text-xs text-slate-500", className)}>
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 hover:text-slate-900 transition-colors group"
      >
        {label}
        <Icon
          className={cn(
            "h-3 w-3",
            active
              ? "text-slate-900"
              : "text-slate-300 group-hover:text-slate-400",
          )}
        />
      </button>
    </TableHead>
  );
}

export default function ServiceOrders() {
  const { orders } = useServiceOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get("status") ?? ALL) as Filter;
  const search = searchParams.get("q") ?? "";
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = orders.filter((order) => {
    const matchesStatus = filter === ALL || order.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      `${order.vehicle.make} ${order.vehicle.model}`
        .toLowerCase()
        .includes(q) ||
      order.vehicle.licensePlate.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const sorted = useMemo(() => {
    const multiplier = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "order":
          return multiplier * a.orderNumber.localeCompare(b.orderNumber);
        case "created":
          return multiplier * a.createdAt.localeCompare(b.createdAt);
        case "status":
          return (
            multiplier *
            (STATUS_STEPS.indexOf(a.status) - STATUS_STEPS.indexOf(b.status))
          );
        case "priority":
          return (
            multiplier *
            ((PRIORITY_RANK[a.priority] ?? 0) -
              (PRIORITY_RANK[b.priority] ?? 0))
          );
        case "total":
          return multiplier * (calcOrderTotal(a) - calcOrderTotal(b));
        default:
          return 0;
      }
    });
  }, [filtered, sortKey, sortDir]);

  const tabs: { value: Filter; label: string; count: number }[] = [
    { value: ALL, label: "All", count: orders.length },
    ...Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({
      value: key as ServiceOrderStatus,
      label,
      count: orders.filter((o) => o.status === key).length,
    })),
  ];

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="border-b bg-white px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Service Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <Link
          to="/service-orders/new"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      <div className="px-8 py-6 pb-10 space-y-4">
        {/* Search + filter */}
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, customers, vehicles…"
              value={search}
              onChange={(e) =>
                setSearchParams(
                  (prev) => {
                    const next = new URLSearchParams(prev);
                    e.target.value
                      ? next.set("q", e.target.value)
                      : next.delete("q");
                    return next;
                  },
                  { replace: true },
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  tab.value === ALL
                    ? next.delete("status")
                    : next.set("status", tab.value);
                  return next;
                })
              }
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  filter === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <SortHead
                  label="Order"
                  sortKey="order"
                  active={sortKey === "order"}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <TableHead className="text-xs text-slate-500">
                  Vehicle
                </TableHead>
                <TableHead className="text-xs text-slate-500">
                  Customer
                </TableHead>
                <SortHead
                  label="Status"
                  sortKey="status"
                  active={sortKey === "status"}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortHead
                  label="Priority"
                  sortKey="priority"
                  active={sortKey === "priority"}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortHead
                  label="Created"
                  sortKey="created"
                  active={sortKey === "created"}
                  dir={sortDir}
                  onSort={handleSort}
                />
                <SortHead
                  label="Total"
                  sortKey="total"
                  active={sortKey === "total"}
                  dir={sortDir}
                  onSort={handleSort}
                  className="text-right"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-sm text-slate-400"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <TableCell>
                      <Link
                        to={`/service-orders/${order.id}`}
                        className="font-medium text-sm text-slate-900 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      <p>
                        {order.vehicle.year} {order.vehicle.make}{" "}
                        {order.vehicle.model}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.vehicle.licensePlate}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      <p>{order.customer.name}</p>
                      {order.customer.company && (
                        <p className="text-xs text-slate-400">
                          {order.customer.company}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={order.priority} />
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 text-left font-medium">
                      {formatCurrency(calcOrderTotal(order))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
