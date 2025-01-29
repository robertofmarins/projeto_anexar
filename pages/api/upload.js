import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Impede o Next.js de processar automaticamente o corpo da requisição
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Usando a função direta do formidable
    const form = formidable({
      uploadDir: path.join(process.cwd(), '/public/uploads'), // Diretório para salvar o arquivo
      keepExtensions: true, // Mantém a extensão original do arquivo
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao fazer upload do arquivo', error: err.message });
      }

      // Aqui você pode acessar os arquivos enviados e processá-los
      console.log(files);

      // Resposta de sucesso
      return res.status(200).json({ message: 'Currículo enviado com sucesso' });
    });
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}
