import sharp from "sharp";

export class CompressorUtil {
    public static async compressImage(
        buffer: Buffer,
        format: "jpeg" | "png" = "jpeg",
        quality: number = 50,
        width: number = 200 
    ): Promise<Buffer> {
        try {
            const compressedBuffer = await sharp(buffer)
                .resize({ width }) 
                .toFormat(format, { quality }) 
                .toBuffer();

            return compressedBuffer;
        } catch (error: any) {
            throw new Error(`Failed to compress image: ${error.message}`);
        }
    }
}
