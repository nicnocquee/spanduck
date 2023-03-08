import { IQuery } from "@/api/interfaces/query";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

type Query = {
  from?: number;
  to?: number;
  limit?: number;
  order?: Record<string, string>;
  filter?: Record<string, string | number | boolean | undefined>;
};

export default function buildQueryParams(query: Query) {
  // Check if there is a query params
  const searchParams = new URLSearchParams();
  const { from, to, limit, order, filter } = query;
  if (filter) {
    const mapped = Object.keys(filter)
      .map((key) => `${key}:${filter[key]}`)
      .join(";");
    searchParams.append("filter", decodeURIComponent(mapped));
  }

  if (order) {
    const mapped = Object.keys(order)
      .map((key) => `${key}:${order[key]}`)
      .join(";");
    searchParams.append("order", decodeURIComponent(mapped));
  }

  if (limit) {
    searchParams.append("limit", limit.toString());
  }

  if (from && to) {
    searchParams.append("from", from.toString());
    searchParams.append("to", to.toString());
  }

  // Return modified query
  return searchParams;
}
