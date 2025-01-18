export function convertToString<T extends object>(data: T): T {
    const convert = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.map(convert);
        } else if (obj && typeof obj === "object") {
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => {
                    if (key === "id" || key.endsWith("_id")) {
                        if (typeof value === "bigint") {
                            return [key, value.toString()];
                        }
                    }
                    if (key.endsWith('at') || key === 'timestamp'){
                        return [key, value]
                    }
                    return [key, convert(value)];
                })
            );
        }
        return obj;
    };
    return convert(data);
}