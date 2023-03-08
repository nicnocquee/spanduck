import { IQuery } from "@/api/interfaces/query";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

export default function getWithQuery(
  base: PostgrestFilterBuilder<any, any, any>,
  query?: IQuery
) {
  // Check if there is a query params
  if (query) {
    const { from, to, limit, order, filter } = query;
    if (filter) {
      const filters = filter.split(";");
      for (let f of filters) {
        const [key, value] = f.split(":");
        if (key.endsWith("_id")) {
          base = base.eq(key, value);
        } else {
          base = base.ilike(key, `%${value}%`);
        }
      }
    }

    if (order) {
      const sorts = order.split(";");
      for (let sort of sorts) {
        const [key, value] = sort.split(":");
        base = base.order(key, {
          ascending: value === "asc" ? true : false,
        });
      }
    }

    if (limit) {
      base = base.limit(limit);
    }

    if (from && to) {
      base = base.range(from, to);
    }

    // Return modified query
    return base;
  }

  // Return query as-is
  return base;
}
