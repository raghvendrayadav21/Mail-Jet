import React, { useState } from 'react';

const EmailForm = ({ onSubmit, isLoading }) => {
  const [emailContent, setEmailContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailContent.trim()) {
      onSubmit(emailContent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="emailInput">Paste Incoming Email</label>
        <textarea
          id="emailInput"
          placeholder="Paste the email you want to reply to here..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          disabled={isLoading}
          required
        ></textarea>
      </div>
      <button 
        type="submit" 
        className="btn" 
        disabled={isLoading || !emailContent.trim()}
      >
        {isLoading ? 'Generating...' : 'Generate Response ✨'}
      </button>
    </form>
  );
};

export default EmailForm;
