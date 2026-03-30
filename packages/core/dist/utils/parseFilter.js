"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFilters = void 0;
const allowedOperators = [
    "eq",
    "equals",
    "ne",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "nin",
    "regex",
    "exists",
];
const parseFilters = (filters) => {
    const query = {};
    for (const filter of filters) {
        if (!filter || typeof filter !== "object") {
            throw new Error("Invalid filter object.");
        }
        const { field, operator, value } = filter;
        if (!field || typeof field !== "string") {
            throw new Error("Filter field must be a non-empty string.");
        }
        if (!allowedOperators.includes(operator)) {
            throw new Error(`Unsupported operator: "${operator}".`);
        }
        switch (operator) {
            case "eq":
            case "equals":
                query[field] = value;
                break;
            case "ne":
                query[field] = { $ne: value };
                break;
            case "gt":
                query[field] = { $gt: value };
                break;
            case "gte":
                query[field] = { $gte: value };
                break;
            case "lt":
                query[field] = { $lt: value };
                break;
            case "lte":
                query[field] = { $lte: value };
                break;
            case "in":
                if (!Array.isArray(value))
                    throw new Error("Operator 'in' expects an array value.");
                query[field] = { $in: value };
                break;
            case "nin":
                if (!Array.isArray(value))
                    throw new Error("Operator 'nin' expects an array value.");
                query[field] = { $nin: value };
                break;
            case "regex":
                if (typeof value !== "string")
                    throw new Error("Operator 'regex' expects a string value.");
                query[field] = { $regex: value, $options: "i" };
                break;
            case "exists":
                if (typeof value !== "boolean")
                    throw new Error("Operator 'exists' expects a boolean value.");
                query[field] = { $exists: value };
                break;
            default:
                throw new Error("Invalid filter operator.");
        }
    }
    return query;
};
exports.parseFilters = parseFilters;
//# sourceMappingURL=parseFilter.js.map