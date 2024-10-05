using System.Runtime.InteropServices;

class PowerManager
{
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    internal struct TokPriv1Luid
    {
        public int Count;
        public long Luid;
        public int Attr;
    }

    [DllImport("kernel32.dll", ExactSpelling = true)]
    internal static extern IntPtr GetCurrentProcess();

    [DllImport("advapi32.dll", ExactSpelling = true, SetLastError = true)]
    internal static extern bool OpenProcessToken(IntPtr h, int acc, ref IntPtr
    phtok);

    [DllImport("advapi32.dll", SetLastError = true)]
    internal static extern bool LookupPrivilegeValue(string host, string name,
    ref long pluid);

    [DllImport("advapi32.dll", ExactSpelling = true, SetLastError = true)]
    internal static extern bool AdjustTokenPrivileges(IntPtr htok, bool disall,
    ref TokPriv1Luid newst, int len, IntPtr prev, IntPtr relen);

    [DllImport("user32.dll", ExactSpelling = true, SetLastError = true)]
    internal static extern bool ExitWindowsEx(int flg, int rea);

    internal static int SE_PRIVILEGE_ENABLED = 0x00000002;
    internal static int TOKEN_QUERY = 0x00000008;
    internal static int TOKEN_ADJUST_PRIVILEGES = 0x00000020;
    internal static string SE_SHUTDOWN_NAME = "SeShutdownPrivilege";
    internal static int EWX_SHUTDOWN = 0x00000001;
    internal static int EWX_REBOOT = 0x00000002;

    private static void DoExitWin(int flg)
    {
        bool ok;
        TokPriv1Luid tp;
        IntPtr hproc = GetCurrentProcess();
        IntPtr htok = IntPtr.Zero;
        ok = OpenProcessToken(hproc, TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, ref htok);
        tp.Count = 1;
        tp.Luid = 0;
        tp.Attr = SE_PRIVILEGE_ENABLED;
        ok = LookupPrivilegeValue(null, SE_SHUTDOWN_NAME, ref tp.Luid);
        ok = AdjustTokenPrivileges(htok, false, ref tp, 0, IntPtr.Zero, IntPtr.Zero);
        ok = ExitWindowsEx(flg, 0);
    }

    public static void Shutdown()
    {
        DoExitWin(EWX_SHUTDOWN);
    }

    public static void Reboot()
    {
        DoExitWin(EWX_REBOOT);
    }
}