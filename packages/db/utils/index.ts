import type { State as KendoState } from "@progress/kendo-data-query";
import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  like,
  ne,
  notIlike,
  notLike,
  or,
  sql,
} from "drizzle-orm";
import { type PgColumn, PgSelect } from "drizzle-orm/pg-core";
import { db } from "../index";

import type { FilterDescriptor } from "@progress/kendo-data-query";

import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export const getOperator = (
  compare: PgColumn,
  operation: string,
  value: string,
) => {
  switch (operation) {
    case "eq":
    case "isEquals":
      return eq(compare, value);
    case "neq":
    case "isNotEquals":
      return ne(compare, value);
    case "contains":
      return ilike(compare, `%${value}%`);
    case "doesnotcontain":
    case "doesNotContain":
      return notIlike(compare, `%${value}%`);
    case "startsWith":
      return ilike(compare, `${value}%`);
    case "endsWith":
      return ilike(compare, `%${value}`);
    case "isnull":
    case "isNull":
      return isNull(compare);
    case "isnotnull":
    case "isNotNull":
      return isNotNull(compare);
    case "isempty":
    case "isEmpty":
      return eq(compare, "");
    case "isnotempty":
    case "isNotEmpty":
      return ne(compare, "");
  }
  return undefined;
};

export const kendoWhereQuery = (
  filterableColumns: { [key: string]: PgColumn },
  state: KendoState,
) => {
  const fields: SQL<unknown>[] = [];

  const filters = state.filter?.filters ?? [];
  for (const f of filters) {
    const filterDesc = f as FilterDescriptor;
    if (typeof filterDesc.field === "string") {
      const column = filterableColumns[filterDesc.field];
      if (column) {
        if (typeof filterDesc.operator === "string") {
          const op = getOperator(column, filterDesc.operator, filterDesc.value);
          if (op) {
            fields.push(op);
          }
        } else {
          const op = getOperator(column, "contains", filterDesc.value);
          if (op) {
            fields.push(op);
          }
        }
      }
    }
  }

  return state.filter?.logic === "or" ? or(...fields) : and(...fields);
};

export const kendoSort = (
  filterableColumns: { [key: string]: PgColumn },
  state: KendoState,
) => {
  const sortedColumns: SQL<unknown>[] = [];

  for (const sort of state.sort ?? []) {
    const column = filterableColumns[sort.field];
    if (column) {
      sortedColumns.push(sort.dir === "asc" ? asc(column) : desc(column));
    }
  }

  return sortedColumns;
};

export const tanstackSort = (
  filterableColumns: { [key: string]: PgColumn },
  state: SortingState,
) => {
  const sortedColumns: SQL<unknown>[] = [];

  for (const sort of state) {
    if (!sort) continue;
    const column = filterableColumns[sort.id];
    if (!column) continue;

    sortedColumns.push(sort.desc ? desc(column) : asc(column));
  }

  return sortedColumns;
};

export const tanstackWhereQuery = (
  filterableColumns: { [key: string]: PgColumn },
  filters: ColumnFiltersState,
) => {
  const fields: SQL<unknown>[] = [];

  for (const filter of filters) {
    if (!filter) continue;

    const column = filterableColumns[filter.id];
    if (!column) continue;
    const value = filter.value;
    if (typeof value !== "string") continue;
    const [operator, ...rest] = value.split(";");
    const joined = rest.join("");
    if (joined === "") continue;

    const op = getOperator(column, operator ?? "contains", joined);
    if (op) {
      fields.push(op);
    }
  }

  return and(...fields);
};
