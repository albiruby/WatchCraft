param(
  [Parameter(Mandatory = $true)][string]$Output,
  [int]$Width = 1000,
  [int]$Height = 850
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class SimShot {
  public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr lParam);
  [DllImport("user32.dll")] public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int pid);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder sb, int max);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr hWnd, int idx);
  [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr hWnd, int idx, int val);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr after, int x, int y, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int cmd);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }

  public static IntPtr Find(int pid) {
    IntPtr found = IntPtr.Zero;
    EnumWindows((h, l) => {
      int p; GetWindowThreadProcessId(h, out p);
      if (p == pid) {
        var t = new StringBuilder(512); GetWindowText(h, t, 512);
        if (t.ToString().Contains("CIQ Simulator")) found = h;
      }
      return true;
    }, IntPtr.Zero);
    return found;
  }

  public static string Run(IntPtr h, string path, int w, int ht) {
    if (IsIconic(h)) {
      int style = GetWindowLong(h, -16);
      style &= ~0x20000000;
      style |= 0x10000000;
      SetWindowLong(h, -16, style);
      ShowWindow(h, 9);
    }
    SetWindowPos(h, new IntPtr(-1), 0, 0, w, ht, 0x0040);
    System.Threading.Thread.Sleep(2000);
    RECT r; GetWindowRect(h, out r);
    int cw = r.Right - r.Left, ch = r.Bottom - r.Top;
    using (var bmp = new Bitmap(cw, ch, PixelFormat.Format32bppArgb))
    using (var g = Graphics.FromImage(bmp)) {
      g.CopyFromScreen(r.Left, r.Top, 0, 0, new Size(cw, ch));
      bmp.Save(path, ImageFormat.Png);
    }
    SetWindowPos(h, new IntPtr(-2), 0, 0, 0, 0, 0x0001 | 0x0002 | 0x0040);
    return cw + "x" + ch + " at " + r.Left + "," + r.Top;
  }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
$p = Get-Process simulator -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $p) { throw "Simulator tidak berjalan." }
$h = [SimShot]::Find($p.Id)
if ($h -eq [IntPtr]::Zero) { throw "Jendela simulator tidak ditemukan." }
[SimShot]::Run($h, $Output, $Width, $Height)
