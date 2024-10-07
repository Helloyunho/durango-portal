using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Win32;

class AppManager
{
    public static string[] GetInstalledApps()
    {
        using (Process process = new Process())
        {
            process.StartInfo.FileName = "MinDeployAppx.exe";
            process.StartInfo.Arguments = "/GetPackages";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.Start();
            string output = process.StandardOutput.ReadToEnd();
            process.WaitForExit();
            if (process.ExitCode != 0)
            {
                throw new Exception($"Failed to get installed apps: {process.ExitCode}");
            }
            return output.Split('\n', StringSplitOptions.RemoveEmptyEntries)[..^1].Select(line => line.Trim()).ToArray();
        }
    }

    public static void RemoveApp(string package)
    {
        using (Process process = new Process())
        {
            process.StartInfo.FileName = "MinDeployAppx.exe";
            process.StartInfo.Arguments = $"/Remove /PackageFullName:{package}";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.Start();
            process.WaitForExit();
            if (process.ExitCode != 0)
            {
                throw new Exception($"Failed to remove app: {process.ExitCode}");
            }
        }
    }

    public static void InstallCert(string path)
    {
        X509Certificate2 cert = new X509Certificate2(path);
        using (X509Store store = new X509Store(StoreName.Root, StoreLocation.LocalMachine))
        {
            store.Open(OpenFlags.ReadWrite);
            store.Add(cert);
        }
    }

    public static void InstallApp(string path)
    {
        RegistryKey HKLM = Registry.LocalMachine;
        HKLM.SetValue(@"SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock\AllowDevelopmentWithoutDevLicense", 1, RegistryValueKind.DWord);
        HKLM.SetValue(@"SOFTWARE\Policies\Microsoft\Windows\Appx\AllowDevelopmentWithoutDevLicense", 1, RegistryValueKind.DWord);
        HKLM.SetValue(@"OSDATA\SOFTWARE\Microsoft\SecurityManager\InternalDevUnlock", 4, RegistryValueKind.DWord);

        using (Process process = new Process())
        {
            process.StartInfo.FileName = "MinDeployAppx.exe";
            process.StartInfo.Arguments = $"/Add /PackagePath:\"{path}\"";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.Start();
            process.WaitForExit();
            if (process.ExitCode != 0)
            {
                throw new Exception($"Failed to install app: {process.ExitCode}");
            }
        }
    }
}