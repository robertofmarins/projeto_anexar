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
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true; // Mantém a extensão original do arquivo

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao fazer upload do arquivo', error: err.message });
      }

      // Aqui você pode acessar os arquivos enviados
      const file = files.file[0]; // Supondo que o nome do campo seja 'file'

      try {
        // Fazendo upload do arquivo para o Supabase diretamente
        const { data, error } = await supabase.storage
          .from('curriculos') // Nome do bucket no Supabase
          .upload(`uploads/${file.newFilename}`, fs.createReadStream(file.filepath), {
            contentType: file.mimetype,
          });

        if (error) {
          throw error;
        }

        // Retornar a URL do arquivo ou uma resposta de sucesso
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/curriculos/${data.path}`;
        console.log('Arquivo enviado para o Supabase:', fileUrl);

        // Resposta de sucesso
        return res.status(200).json({ message: 'Currículo enviado com sucesso', fileUrl });
      } catch (error) {
        return res.status(500).json({ message: 'Erro ao fazer upload para o Supabase', error: error.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
