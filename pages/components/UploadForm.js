import { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Para controle de loading

  // Atualiza o estado com o arquivo selecionado
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Envia o arquivo quando o formulário for enviado
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Por favor, selecione um arquivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // Adiciona o arquivo ao FormData

    try {
      setLoading(true); // Inicia o carregamento

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json(); // Obtém a resposta do servidor

      if (res.ok) {
        setMessage('Currículo enviado com sucesso!');
      } else {
        setMessage(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMessage('Erro ao enviar o currículo.');
      console.error(error);
    } finally {
      setLoading(false); // Termina o carregamento
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
