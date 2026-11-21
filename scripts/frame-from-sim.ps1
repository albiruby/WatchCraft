param(
  [Parameter(Mandatory = $true)][string]$Screenshot,
  [Parameter(Mandatory = $true)][string]$Output
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class FrameCrop {
  static bool White(byte[] b, int s, int x, int y) {
    int i = y * s + x * 4;
    return b[i] >= 246 && b[i+1] >= 246 && b[i+2] >= 246;
  }

  public static string Run(string src, string dst) {
    using (var o = new Bitmap(src))
    using (var bmp = new Bitmap(o.Width, o.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(o, 0, 0);
      int w = bmp.Width, h = bmp.Height;
      var d = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int s = d.Stride; byte[] b = new byte[s * h];
      Marshal.Copy(d.Scan0, b, 0, b.Length);

      // Magenta screen bounds.
      int sx0 = w, sx1 = -1, sy0 = h, sy1 = -1;
      for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
        int i = y * s + x * 4;
        if (b[i+2] > 240 && b[i+1] < 20 && b[i] > 240) {
          if (x < sx0) sx0 = x; if (x > sx1) sx1 = x;
          if (y < sy0) sy0 = y; if (y > sy1) sy1 = y;
        }
      }
      if (sx1 < 0) throw new Exception("Layar magenta tidak ditemukan.");

      // Body bounds: flood fill the watch body from the bezel just outside the screen.
      Func<int,int,bool> nonWhite = (x, y) => {
        int i = y * s + x * 4;
        return b[i] < 244 || b[i+1] < 244 || b[i+2] < 244;
      };
      int px = (sx0 + sx1) / 2;
      int[] seedX = { px, px, sx0 - 6, sx1 + 6, px };
      int[] seedY = { sy0 - 6, sy1 + 6, (sy0 + sy1) / 2, (sy0 + sy1) / 2, sy0 - 18 };
      int start = -1;
      for (int k = 0; k < seedX.Length; k++) {
        int x = seedX[k], y = seedY[k];
        if (x >= 0 && y >= 0 && x < w && y < h && nonWhite(x, y)) { start = y * w + x; break; }
      }
      if (start < 0) throw new Exception("Bodi jam tidak ditemukan di sekitar layar.");

      var seen = new bool[w * h];
      var q = new Queue<int>();
      seen[start] = true; q.Enqueue(start);
      int bx0 = w, bx1 = -1, by0 = h, by1 = -1;
      while (q.Count > 0) {
        int p = q.Dequeue(); int x = p % w, y = p / w;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
        if (y < by0) by0 = y; if (y > by1) by1 = y;
        if (x > 0 && !seen[p - 1] && nonWhite(x - 1, y)) { seen[p - 1] = true; q.Enqueue(p - 1); }
        if (x < w - 1 && !seen[p + 1] && nonWhite(x + 1, y)) { seen[p + 1] = true; q.Enqueue(p + 1); }
        if (y > 0 && !seen[p - w] && nonWhite(x, y - 1)) { seen[p - w] = true; q.Enqueue(p - w); }
        if (y < h - 1 && !seen[p + w] && nonWhite(x, y + 1)) { seen[p + w] = true; q.Enqueue(p + w); }
      }

      // Guard against leaking into the simulator panel behind the watch.
      if (bx1 - bx0 + 1 > w * 0.95 || by1 - by0 + 1 > h * 0.95) {
        int pad = (sx1 - sx0 + 1);
        bx0 = Math.Max(0, sx0 - pad); bx1 = Math.Min(w - 1, sx1 + pad);
        by0 = Math.Max(0, sy0 - pad); by1 = Math.Min(h - 1, sy1 + pad);
      }

      bmp.UnlockBits(d);
      int cw = bx1 - bx0 + 1, ch = by1 - by0 + 1;
      using (var cut = new Bitmap(cw, ch, PixelFormat.Format32bppArgb))
      using (var g = Graphics.FromImage(cut)) {
        g.DrawImage(bmp, new Rectangle(0, 0, cw, ch), new Rectangle(bx0, by0, cw, ch), GraphicsUnit.Pixel);
        var cd = cut.LockBits(new Rectangle(0, 0, cw, ch), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int cs = cd.Stride; byte[] cb = new byte[cs * ch];
        Marshal.Copy(cd.Scan0, cb, 0, cb.Length);

        // Remove the white background connected to the crop edges.
        var outside = new bool[cw * ch];
        var q2 = new Queue<int>();
        Action<int,int> push2 = (x, y) => {
          if (x < 0 || y < 0 || x >= cw || y >= ch) return;
          int p = y * cw + x;
          if (outside[p]) return;
          int i = y * cs + x * 4;
          if (!(cb[i] >= 244 && cb[i+1] >= 244 && cb[i+2] >= 244)) return;
          outside[p] = true; q2.Enqueue(p);
        };
        for (int x = 0; x < cw; x++) { push2(x, 0); push2(x, ch - 1); }
        for (int y = 0; y < ch; y++) { push2(0, y); push2(cw - 1, y); }
        while (q2.Count > 0) {
          int p = q2.Dequeue(); int x = p % cw, y = p / cw;
          push2(x - 1, y); push2(x + 1, y); push2(x, y - 1); push2(x, y + 1);
        }
        for (int y = 0; y < ch; y++) for (int x = 0; x < cw; x++) {
          int i = y * cs + x * 4;
          if (outside[y * cw + x]) { cb[i] = 0; cb[i+1] = 0; cb[i+2] = 0; cb[i+3] = 0; }
        }

        // Cut the circular screen so the frame is hollow.
        double scx = (sx0 + sx1) / 2.0 - bx0;
        double scy = (sy0 + sy1) / 2.0 - by0;
        double r = (sx1 - sx0 + 1) / 2.0 + 1.5;
        for (int y = 0; y < ch; y++) for (int x = 0; x < cw; x++) {
          double dx = x - scx, dy = y - scy;
          if (dx * dx + dy * dy <= r * r) {
            int i = y * cs + x * 4;
            cb[i] = 0; cb[i+1] = 0; cb[i+2] = 0; cb[i+3] = 0;
          }
        }

        Marshal.Copy(cb, 0, cd.Scan0, cb.Length);
        cut.UnlockBits(cd);
        cut.Save(dst, ImageFormat.Png);
      }

      int screenSize = sx1 - sx0 + 1;
      int holeLeft = (int)Math.Round((sx0 + sx1) / 2.0 - bx0 - screenSize / 2.0);
      int holeTop = (int)Math.Round((sy0 + sy1) / 2.0 - by0 - screenSize / 2.0);
      return "{\"width\":" + cw + ",\"height\":" + ch + ",\"hole\":{\"left\":" + holeLeft + ",\"top\":" + holeTop + ",\"size\":" + screenSize + "},\"screenScale\":" + (screenSize / 218.0).ToString("0.####") + "}";
    }
  }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[FrameCrop]::Run($Screenshot, $Output)
