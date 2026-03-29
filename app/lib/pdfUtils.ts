import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  // If we are on the server (SSR), return null to avoid crashing
  if (typeof window === 'undefined') {
    console.log("loadPdfJs: Cannot run on server, returning null.");
    return null;
  }
  
  if (pdfjsLib) {
    // console.log("loadPdfJs: PDF.js library already loaded.");
    return pdfjsLib;
  }
  if (loadPromise) {
    // console.log("loadPdfJs: PDF.js library is currently loading.");
    return loadPromise;
  }

  // console.log("loadPdfJs: Starting to load PDF.js library and worker...");
  isLoading = true;
  
  loadPromise = Promise.all([
      import('pdfjs-dist'),
      // @ts-ignore
      import('pdfjs-dist/build/pdf.worker.mjs?worker')
  ]).then(([lib, WorkerModule]) => {
      // console.log("loadPdfJs: Successfully imported PDF.js library and worker module.");
      lib.GlobalWorkerOptions.workerPort = new WorkerModule.default();
      pdfjsLib = lib;
      isLoading = false;
      // console.log("loadPdfJs: PDF.js library and worker initialized successfully.");
      return lib;
  }).catch(err => {
      console.error("loadPdfJs: Failed to load PDF.js and its worker via Vite.", err);
      return import('pdfjs-dist').then(lib => {
          // console.log("loadPdfJs: Fallback - successfully imported PDF.js library without worker.");
          pdfjsLib = lib;
          isLoading = false;
          return lib;
      }).catch(fallbackErr => {
          console.error("loadPdfJs: Fallback - failed to load PDF.js library.", fallbackErr);
          isLoading = false;
          loadPromise = null;
          return null;
      });
  });

  return loadPromise;
}

/**
 * Extracts text from a PDF file
 */
export async function extractTextFromPdf(file: File): Promise<string> {
    if (typeof window === 'undefined') return "";

    try {
        // console.log("extractTextFromPdf: Attempting to load PDF.js...");
        const lib = await loadPdfJs();
        if (!lib) {
          console.error("extractTextFromPdf: PDF.js library is null.");
          return "";
        }
        // console.log("extractTextFromPdf: PDF.js loaded, proceeding with text extraction.");

        const arrayBuffer = await file.arrayBuffer();
        
        const loadingTask = lib.getDocument({ 
            data: arrayBuffer,
        });
        
        const pdf = await loadingTask.promise;
        // console.log(`extractTextFromPdf: PDF loaded with ${pdf.numPages} pages.`);
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // *** ADDED DETAILED LOGGING HERE ***
            console.log(`Page ${i} textContent:`, textContent);
            
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
                
            fullText += pageText + '\n\n';
        }
        
        // console.log("extractTextFromPdf: Text extraction successful.");
        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
    }
}

/**
 * Converts the first page of a PDF to an image
 */
export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  if (typeof window === 'undefined') {
      return { imageUrl: "", file: null, error: "Cannot run on server" };
  }

  try {
    const lib = await loadPdfJs();
    if (!lib) throw new Error("Could not load PDF.js");

    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = lib.getDocument({ 
        data: arrayBuffer,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${lib.version}/standard_fonts/`
    });
    
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}