import { del, put } from "@vercel/blob";

export interface BlobUploadResponse {
    url: string;
    size: number;
    contentType: string;
}

export interface FileData {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
}

export class BlobUtil {
    private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static readonly ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    public static async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<BlobUploadResponse> {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error("File is empty");
        }

        if (fileBuffer.length > this.MAX_FILE_SIZE) {
            throw new Error("File size exceeds the maximum limit of 5 MB");
        }

        if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
            throw new Error(`Invalid file type. Only JPG and PNG files are allowed. Received: ${mimeType}`);
        }

        const blob = await put(fileName, fileBuffer, {
            access: "public",
            contentType: mimeType,
        });

        return {
            url: blob.url,
            size: fileBuffer.length,
            contentType: mimeType,
        };
    }

    public static async deleteFile(filePath: string): Promise<void> {
        try {
            await del(filePath);
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

}
