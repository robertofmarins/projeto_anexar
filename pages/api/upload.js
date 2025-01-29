import formidable from 'formidable'; 
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
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
    const form = formidable(); // Instanciando o formidable
    const uploadDir = path.join(process.cwd(), '/public/uploads');

    // Verifica se o diretório de uploads existe, caso contrário, cria
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.uploadDir = uploadDir; 
    form.keepExtensions = true; // Mantém a extensão do arquivo

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro ao processar o upload:', err);
        return res.status(500).json({ message: 'Erro ao processar o upload', error: err.message });
      }

      const file = files.file ? files.file[0] : null;
      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
      }

      const filePath = path.join(form.uploadDir, file.newFilename);

      try {
        // Lê o arquivo e o transforma em Buffer
        const fileBuffer = fs.readFileSync(filePath);

        // Fazendo o upload diretamente para o Supabase
        const { data, error } = await supabase
          .storage
          .from('curriculos') 
          .upload(file.newFilename, fileBuffer, {
            cacheControl: '3600',
            upsert: false,  
            contentType: file.mimetype,  
          });

        if (error) {
          console.error('Erro ao fazer upload para o Supabase:', error.message);
          return res.status(500).json({ message: 'Erro ao fazer upload para o Supabase', error: error.message });
        }

        const fileUrl = `${supabaseUrl}/storage/v1/object/public/curriculos/${file.newFilename}`;
        return res.status(200).json({ message: 'Currículo enviado com sucesso', fileUrl });
      } catch (error) {
        console.error('Erro ao fazer upload para o Supabase:', error.message);
        return res.status(500).json({ message: 'Erro ao fazer upload para o Supabase', error: error.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
