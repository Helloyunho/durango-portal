using System.Management;

class PowerManager
{
    public static void Shutdown()
    {
        ManagementBaseObject mboShutdown = null;
        ManagementClass mcWin32 = new ManagementClass("Win32_OperatingSystem");
        mcWin32.Get();

        // You can't shutdown without security privileges
        mcWin32.Scope.Options.EnablePrivileges = true;
        ManagementBaseObject mboShutdownParams =
                mcWin32.GetMethodParameters("Win32Shutdown");

        mboShutdownParams["Flags"] = "1";
        mboShutdownParams["Reserved"] = "0";
        foreach (ManagementObject manObj in mcWin32.GetInstances())
        {
            mboShutdown = manObj.InvokeMethod("Win32Shutdown",
                                        mboShutdownParams, null);
        }
    }

    public static void Reboot()
    {
        ManagementBaseObject mboShutdown = null;
        ManagementClass mcWin32 = new ManagementClass("Win32_OperatingSystem");
        mcWin32.Get();

        // You can't shutdown without security privileges
        mcWin32.Scope.Options.EnablePrivileges = true;
        ManagementBaseObject mboShutdownParams =
                mcWin32.GetMethodParameters("Win32Shutdown");

        mboShutdownParams["Flags"] = "2";
        mboShutdownParams["Reserved"] = "0";
        foreach (ManagementObject manObj in mcWin32.GetInstances())
        {
            mboShutdown = manObj.InvokeMethod("Win32Shutdown",
                                        mboShutdownParams, null);
        }
    }
}