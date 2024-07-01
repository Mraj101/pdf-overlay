import React, { useState } from 'react';

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
          <iframe
            src={pdfFile}
            title="Selected PDF"
            width="100%"
            height="600px"
            frameBorder="0"
          />
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
