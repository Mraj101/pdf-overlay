import React, { useState } from 'react';
import { Viewer, Plugin, PluginOnCanvasLayerRender, LayerRenderStatus } from '@react-pdf-viewer/core';

const CustomCanvasPlugin = () => {
    const onCanvasLayerRender = (e) => {
        if (e.status !== LayerRenderStatus.DidRender) {
            return;
        }

        const canvas = e.ele;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const message = 'Your signature here'; // Customize this message

        // Set font size and style
        ctx.font = '20px Arial'; // Example font size and style
        ctx.textAlign = 'center';
        ctx.fillStyle = '#CCC';

        // Draw the message
        ctx.fillText(message, centerX, 100);
    };

    return onCanvasLayerRender; // Return the function directly
};


const PdfView = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        setPdfFile(URL.createObjectURL(file));
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const customCanvasPluginInstance = CustomCanvasPlugin();

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl underline mb-6">PdfView</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="py-2 px-4 border rounded-lg"
      />
      {pdfFile && (
        <div className="border border-gray-300 mt-6">
          <Viewer fileUrl={pdfFile} plugins={[customCanvasPluginInstance]} />
        </div>
      )}
      {!pdfFile && (
        <p className="mt-6">Please select a PDF file to view</p>
      )}
      {error && (
        <p className="mt-6 text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PdfView;