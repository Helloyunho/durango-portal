// Modified from Interop/msbuild_tasks/mount_connectedstorage.xml
using System.Diagnostics;

class XCrdManager
{
    const string CS_PATH = @"[XTE:]\ConnectedStorage-retail";
    // const string CS_PATH_DEV = @"[XTE:]\ConnectedStorage";

    // For series consoles
    const string CS_PATH_SERIES = @"[XSS:]\ConnectedStorage-retail";
    // const string CS_PATH_SERIES_DEV = @"[XSS:]\ConnectedStorage";

    public static void MountConnectedStorage()
    {
        // TODO: Enumerate matching path directly by querying for the CRD-Path

        string containerPath = CS_PATH_SERIES;

        uint result = XCrd.XCrdOpenAdapter(out IntPtr hAdapter);
        if (hAdapter == IntPtr.Zero)
        {
            throw new Exception($"Failed to open XCRD adapter, code: {result:08x}");
        }

        try
        {
            result = XCrd.XCrdUnmountByPath(hAdapter, containerPath);
        }
        catch (FileNotFoundException)
        {
            // Maybe it's Xbox One, try the other path
            containerPath = CS_PATH;
            result = XCrd.XCrdUnmountByPath(hAdapter, containerPath);
        }

        if (result != 0)
        {
            throw new Exception($"Failed to unmount target xvd, code: {result:08x}");
        }

        result = XCrd.XCrdMount(out IntPtr hDevice, hAdapter, containerPath, 0);
        if (result != 0 || hDevice == IntPtr.Zero)
        {
            throw new Exception($"Failed to mount target xvd, code: {result:08x}");
        }

        result = XCrd.XCrdQueryDevicePath(out string devicePath, hDevice);
        if (result != 0)
        {
            throw new Exception($"Failed to read device path, code: {result:08x}");
        }

        if (hAdapter != IntPtr.Zero)
        {
            XCrd.XCrdCloseAdapter(hAdapter);
        }
        Console.WriteLine("[+] XCRD adapter closed");
        Console.WriteLine($"[*] Now execute: mklink /j T:\\connectedStorage {devicePath}\\");

        using (Process process = new Process())
        {
            process.StartInfo.FileName = "cmd.exe";
            process.StartInfo.Arguments = $"/c \"mklink /j T:\\connectedStorage {devicePath}\\\"";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.Start();
            process.WaitForExit();
            if (process.ExitCode != 0)
            {
                throw new Exception($"Failed to create junction: {process.ExitCode}");
            }
        }
    }

    public static void UnmountConnectedStorage()
    {
        if (Directory.Exists("T:\\connectedStorage"))
        {
            Directory.Delete("T:\\connectedStorage");
        }
    }
}