/**
 * Converts an image file (PNG/JPG) to a PDF Document
 * Note: Requires `pdf-lib` to be installed.
 * Command to install: npm install pdf-lib
 */

export interface ImgToPdfResult {
    pdfUrl: string;
    file: File | null;
    error?: string;
}

export async function convertImageToPdf(imageFile: File): Promise<ImgToPdfResult> {
    if (typeof window === 'undefined') {
        return { pdfUrl: "", file: null, error: "Cannot run on server" };
    }

    try {
        // Dynamically import pdf-lib to keep initial bundle size small
        const { PDFDocument } = await import('pdf-lib');

        // Read the image file into an ArrayBuffer
        const imageBuffer = await imageFile.arrayBuffer();

        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create();

        let image;
        // Determine image type and embed it
        if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBuffer);
        } else if (imageFile.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBuffer);
        } else {
            throw new Error(`Unsupported image type: ${imageFile.type}. Only JPG and PNG are supported.`);
        }

        // Get the dimensions of the image
        const { width, height } = image.scale(1);

        // Add a blank page to the document matching the image dimensions
        const page = pdfDoc.addPage([width, height]);

        // Draw the image onto the page
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: width,
            height: height,
        });

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();

        // Create a Blob from the PDF bytes
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Create a File object
        const originalName = imageFile.name.replace(/\.[^/.]+$/, ""); // Strip extension
        const finalPdfFile = new File([pdfBlob], `${originalName}.pdf`, {
            type: 'application/pdf',
        });

        // Create a URL for the PDF so it can be previewed or downloaded
        const pdfUrl = URL.createObjectURL(pdfBlob);

        return {
            pdfUrl,
            file: finalPdfFile
        };

    } catch (error: any) {
        console.error("Error converting image to PDF:", error);
        return {
            pdfUrl: "",
            file: null,
            error: `Failed to convert Image to PDF: ${error.message}`
        };
    }
}