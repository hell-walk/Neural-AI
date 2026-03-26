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
  if (typeof window === 'undefined') return null;
  
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  
  // In modern Vite/Remix, the best way to handle pdf.js workers automatically 
  // without copying files is to use the standard dynamic import for the worker itself.
  loadPromise = Promise.all([
      import('pdfjs-dist'),
      // @ts-ignore - this relies on Vite's specific import syntax which TS might complain about
      import('pdfjs-dist/build/pdf.worker.mjs?worker')
  ]).then(([lib, WorkerModule]) => {
      // Instantiate the worker class that Vite bundled for us
      lib.GlobalWorkerOptions.workerPort = new WorkerModule.default();
      pdfjsLib = lib;
      isLoading = false;
      return lib;
  }).catch(err => {
      console.error("Failed to load PDF.js and its worker via Vite.", err);
      // Fallback: try to just load the library without the specific worker port config
      return import('pdfjs-dist').then(lib => {
          pdfjsLib = lib;
          isLoading = false;
          return lib;
      });
  });

  return loadPromise;
}

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
    
    // Use standardFontDataUrl to ensure fonts load correctly
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
            // Create a File from the blob with the same name as the pdf
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
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}