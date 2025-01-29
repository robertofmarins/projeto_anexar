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
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const form = formidable();
    const uploadDir = path.join(process.cwd(), "/public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    const filePath = path.join(uploadDir, file.newFilename);
    fs.renameSync(file.filepath, filePath);

    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from("curriculos")
      .upload(file.newFilename, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.mimetype
      });

    if (error) {
      throw new Error(error.message);
    }

    const fileUrl = `${supabaseUrl}/storage/v1/object/public/curriculos/${file.newFilename}`;
    res.status(200).json({ message: "Currículo enviado com sucesso!", fileUrl });

  } catch (error) {
    res.status(500).json({ message: "Erro no upload", error: error.message });
  }
}
