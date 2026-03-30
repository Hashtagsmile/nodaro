import type { FilterOperator } from "../services/document.service";
export interface FilterRequestInput {
    field: string;
    operator: FilterOperator;
    value: unknown;
}
export declare const parseFilters: (filters: FilterRequestInput[]) => Record<string, unknown>;
//# sourceMappingURL=parseFilter.d.ts.map