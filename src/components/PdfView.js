import React, { useState, useRef, useEffect } from 'react';
import { getDocument, PDFWorker } from 'pdfjs-dist/build/pdf';

const PdfView = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pdfCtx, setPdfCtx] = useState(null);
  const [overlayCtx, setOverlayCtx] = useState(null);
  const [pdfCanvas, setPdfCanvas] = useState(null);
  const [overlayCanvas, setOverlayCanvas] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize PDF.js worker
    const worker = new PDFWorker();
    worker.setWorkerSrc('https://mozilla.github.io/pdf.js/build/pdf.worker.min.js');
  
    return () => {
      worker.destroy();
    };
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      const file = fileInputRef.current.files[0];
      const fileReader = new FileReader();
      fileReader.onload = function () {
        const typedArray = new Uint8Array(this.result);
        getDocument({ data: typedArray }).promise.then((pdf) => {
          setPdfDoc(pdf);
          renderPage(pageNum);
        }).catch(error => {
          console.error('Error loading PDF:', error);
        });
      };
      fileReader.readAsArrayBuffer(file);
    };

    if (fileInputRef.current && fileInputRef.current.files.length > 0) {
      loadPdf();
    }
  }, [pageNum]);

  useEffect(() => {
    if (pdfCanvas && overlayCanvas) {
      setPdfCtx(pdfCanvas.getContext('2d'));
      setOverlayCtx(overlayCanvas.getContext('2d'));
    }
  }, [pdfCanvas, overlayCanvas]);

  const renderPage = (num) => {
    setPageRendering(true);
    pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      pdfCanvas.height = viewport.height;
      pdfCanvas.width = viewport.width;

      const renderContext = {
        canvasContext: pdfCtx,
        viewport: viewport,
      };

      page.render(renderContext).promise.then(() => {
        setPageRendering(false);
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          setPageNumPending(null);
        }
        drawAnnotations();
      });
    }).catch(error => {
      console.error('Error rendering page:', error);
    });
  };

  const drawAnnotations = () => {
    if (overlayCtx) {
      overlayCtx.beginPath();
      overlayCtx.arc(50, 50, 20, 0, 2 * Math.PI);
      overlayCtx.fillStyle = 'red';
      overlayCtx.fill();
    }
  };

  const queueRenderPage = (num) => {
    if (pageRendering) {
      setPageNumPending(num);
    } else {
      setPageNum(num);
      renderPage(num);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const typedArray = new Uint8Array(this.result);
      getDocument({ data: typedArray }).promise.then((pdf) => {
        setPdfDoc(pdf);
        renderPage(pageNum);
      }).catch(error => {
        console.error('Error loading PDF:', error);
      });
    };
    fileReader.readAsArrayBuffer(file);
  };

  const handleMouseDown = (event) => {
    setIsDrawing(true);
    draw(event);
  };

  const handleMouseMove = (event) => {
    if (isDrawing) {
      draw(event);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (overlayCtx && overlayCanvas) {
      const { offsetX, offsetY } = event.nativeEvent;
      overlayCtx.beginPath();
      overlayCtx.arc(offsetX, offsetY, 5, 0, Math.PI * 2);
      overlayCtx.fillStyle = 'blue';
      overlayCtx.fill();
    }
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl underline mb-6">PdfView</h1>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="py-2 px-4 border rounded-lg"
      />
      {pdfDoc && (
        <div className="relative border border-gray-300 mt-6">
          <canvas
            ref={(canvas) => setPdfCanvas(canvas)}
            id="pdfCanvas"
            className="absolute top-0 left-0"
          ></canvas>
          <canvas
            ref={(canvas) => setOverlayCanvas(canvas)}
            id="overlayCanvas"
            className="absolute top-0 left-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></canvas>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => queueRenderPage(pageNum + 1)}
          >
            Next Page
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => queueRenderPage(pageNum - 1)}
          >
            Previous Page
          </button>
        </div>
      )}
      {!pdfDoc && (
        <p className="mt-6">Please select a PDF file to view</p>
      )}
    </div>
  );
};

export default PdfView;