import { unlink } from "fs/promises";

export async function removeFile(filePath) {
  if (!filePath) {
    return;
  }

  await unlink(filePath).catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
}

