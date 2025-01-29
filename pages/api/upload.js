import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelos seus dados)
const supabaseUrl = 'https://gszpxfyuoosecjwbyevp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzenB4Znl1b29zZWNqd2J5ZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNTc4NTgsImV4cCI6MjA1MzczMzg1OH0.0JVm5jPnaFQBuh8epef_wNeh7EBmxZslOtPWDOedhzw';
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
  api: {
    bodyParser: false, // Impede o Next.js de processar automaticamente o corpo da requisição
  },
};

export default function handler(req, res) {
  console.log('Requisição recebida:', req.method); // Log da requisição recebida
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), '/public/uploads'); // Diretório temporário para salvar o arquivo
    form.keepExtensions = true; // Mantém a extensão original do arquivo

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log('Erro ao processar o upload:', err.message); // Log do erro
        return res.status(500).json({ message: 'Erro ao fazer upload do arquivo', error: err.message });
      }

      console.log('Campos recebidos:', fields); // Log dos campos do formulário
      console.log('Arquivos recebidos:', files); // Log dos arquivos recebidos

      const file = files.file ? files.file[0] : null; // Garantir que o campo 'file' exista
      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
      }

      const filePath = path.join(form.uploadDir, file.newFilename);
      console.log('Caminho do arquivo no servidor:', filePath); // Log do caminho do arquivo

      try {
        // Fazendo upload do arquivo para o Supabase
        const { data, error } = await supabase.storage
          .from('curriculos') // Nome do bucket no Supabase
          .upload(`uploads/${file.newFilename}`, fs.createReadStream(filePath), {
            contentType: file.mimetype,
          });

        if (error) {
          console.log('Erro no Supabase:', error.message); // Log do erro no Supabase
          throw error;
        }

        // URL do arquivo no Supabase
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/curriculos/${data.path}`;
        console.log('Arquivo enviado para o Supabase:', fileUrl); // Log do URL do arquivo no Supabase

        // Resposta de sucesso
        return res.status(200).json({ message: 'Currículo enviado com sucesso', fileUrl });
      } catch (error) {
        console.log('Erro ao fazer upload para o Supabase:', error.message); // Log do erro no upload
        return res.status(500).json({ message: 'Erro ao fazer upload para o Supabase', error: error.message });
      }
    });
  } else {
    // Se o método não for POST, retorna erro 405
    res.status(405).json({ message: 'Método não permitido' });
  }
}
