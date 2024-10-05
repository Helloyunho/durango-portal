using System.Runtime.InteropServices;

class PowerManager
{
    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool ExitWindowsEx(uint dwFlags, uint dwReserved);

    public static void Shutdown()
    {
        ExitWindowsEx(0x00000001, 0);
    }

    public static void Reboot()
    {
        ExitWindowsEx(0x00000002, 0);
    }
}