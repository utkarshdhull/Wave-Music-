export function getDominantColor(imgUrl) {
  return new Promise((resolve) => {
    if (!imgUrl) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;

        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 180) continue; // skip transparent/semi-transparent pixels

          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];

          // Skip neutral pixels (black/white/gray) to get vibrant accents
          const max = Math.max(red, green, blue);
          const min = Math.min(red, green, blue);
          const chroma = max - min;
          if (chroma < 15) continue; // low color saturation, skip

          // Skip extreme values (too dark or too bright)
          const gray = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
          if (gray < 35 || gray > 230) continue;

          r += red;
          g += green;
          b += blue;
          count++;
        }

        if (count === 0) {
          // Fallback: take average of all pixels if no vibrant pixels found
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        r = Math.round(r / count) || 29;
        g = Math.round(g / count) || 185;
        b = Math.round(b / count) || 84;

        resolve({ r, g, b });
      } catch (e) {
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };
  });
}
