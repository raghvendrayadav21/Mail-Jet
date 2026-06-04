import React, { useState } from 'react';

const ResponseView = ({ responseText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!responseText) return null;

  return (
    <div className="response-container">
      <div className="response-header">
        <label>Generated Response</label>
        <button 
          onClick={handleCopy} 
          className="btn-secondary"
          title="Copy to clipboard"
        >
          {copied ? 'Copied! ✓' : 'Copy'}
        </button>
      </div>
      <div className="response-content">
        {responseText}
      </div>
    </div>
  );
};

export default ResponseView;
