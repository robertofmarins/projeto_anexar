import formidable from "formidable";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false
  }
};

// Configuração do Supabase
const supabaseUrl = 'https://gszpxfyuoosecjwbyevp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzenB4Znl1b29zZWNqd2J5ZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNTc4NTgsImV4cCI6MjA1MzczMzg1OH0.0JVm5jPnaFQBuh8epef_wNeh7EBmxZslOtPWDOedhzw';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  console.log('Requisição recebida: ', req.method);  // Adicionado para ver o método da requisição

  if (req.method !== "POST") {
    console.log('Método não permitido');
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    console.log('Iniciando o processamento do arquivo');

    const form = formidable();
    const uploadDir = path.join(process.cwd(), "/public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Diretório de upload criado:', uploadDir);  // Log para verificar a criação do diretório
    }

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    console.log('Arquivo recebido: ', file);  // Log para verificar o arquivo recebido

    if (!file) {
      console.log('Nenhum arquivo enviado');
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    const filePath = path.join(uploadDir, file.newFilename);
    fs.renameSync(file.filepath, filePath);
    console.log('Arquivo movido para:', filePath);  // Log para verificar se o arquivo foi movido corretamente

    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from("curriculos")
      .upload(file.newFilename, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.mimetype
      });

    if (error) {
      console.log('Erro no upload para Supabase:', error.message);
      throw new Error(error.message);
    }

    const fileUrl = `${supabaseUrl}/storage/v1/object/public/curriculos/${file.newFilename}`;
    console.log('Arquivo enviado com sucesso! URL:', fileUrl);  // Log para verificar a URL do arquivo

    res.status(200).json({ message: "Currículo enviado com sucesso!", fileUrl });

  } catch (error) {
    console.error('Erro no processamento do upload:', error.message);
    res.status(500).json({ message: "Erro no upload", error: error.message });
  }
}
