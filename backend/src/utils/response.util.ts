export const errorResponse = (message: string, errorPayload: any = null) => {
    return {
        success: false,
        message,
        error: errorPayload,
    };
};

export const successResponse = (message:string, body:any) => {
    return {
        success: true,
        message,
        body
    }
}