using System.Runtime.InteropServices;

class BluescreenManager
{
    [DllImport("ntdll.dll")]
    private static extern uint RtlAdjustPrivilege(
        int Privilege,
        bool bEnablePrivilege,
        bool IsThreadPrivilege,
        out bool PreviousValue
    );

    [DllImport("ntdll.dll")]
    private static extern uint NtRaiseHardError(
        uint ErrorStatus,
        uint NumberOfParameters,
        uint UnicodeStringParameterMask,
        IntPtr Parameters,
        uint ValidResponseOption,
        out uint Response
    );

    public static void ShowBluescreen()
    {
        bool previous;
        RtlAdjustPrivilege(19, true, false, out previous);

        uint response;
        NtRaiseHardError(0xc00002b4, 0, 0, IntPtr.Zero, 6, out response);
    }
}
