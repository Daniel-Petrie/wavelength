// src/components/InputForm.js
import React, { useState } from 'react';

function InputForm({ onSubmit }) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSubmit(keyword.trim());
      setKeyword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Enter a keyword"
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default InputForm;