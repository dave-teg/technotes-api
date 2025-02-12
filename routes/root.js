import { Router } from "express";
import path from 'path'
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const dirname = path.dirname(currentFile)

const router = Router()

router.get(['/', '/index', '/index.html'], (req, res) => {
  res.sendFile(path.join(dirname, '..', 'views', 'index.html'))
})

export default router