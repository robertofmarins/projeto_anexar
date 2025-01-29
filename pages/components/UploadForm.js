import { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Por favor, selecione um arquivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Currículo enviado com sucesso!');
      } else {
        setMessage(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMessage('Erro ao enviar o currículo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Currículo'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
