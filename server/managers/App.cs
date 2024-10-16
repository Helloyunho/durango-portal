using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Win32;
using Windows.Management.Deployment;

class AppManager
{
    private static PackageManager packageManager = new PackageManager();

    public static IEnumerable<PackageContainer> ListInstalledApps()
    {
        return packageManager.FindPackages().Select(package => new PackageContainer(package));
    }

    // public static async Task RemoveApp(string package)
    public static void RemoveApp(string package)
    {
        // this also doesnt work yet
        // await packageManager.RemovePackageAsync(package).AsTask();

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
                throw new Exception($"Failed to remove package: {process.ExitCode}");
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

    public static void SetRegistryValue(string key, object value, RegistryValueKind kind)
    {
        string[] keys = key.Split('\\');
        using (RegistryKey HKLM = Registry.LocalMachine)
        {
            RegistryKey currentKey = HKLM;
            foreach (string k in keys[..^1])
            {
                currentKey = currentKey.CreateSubKey(k);
            }
            currentKey.SetValue(keys[^1], value, kind);
        }
    }

    public static void EnableSideloadedApps()
    {
        using (RegistryKey HKLM = Registry.LocalMachine)
        {
            SetRegistryValue(@"SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock\AllowDevelopmentWithoutDevLicense", 1, RegistryValueKind.DWord);
            SetRegistryValue(@"SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock\AllowAllTrustedApps", 1, RegistryValueKind.DWord);
            SetRegistryValue(@"SOFTWARE\Policies\Microsoft\Windows\Appx\AllowDevelopmentWithoutDevLicense", 1, RegistryValueKind.DWord);
            SetRegistryValue(@"SOFTWARE\Policies\Microsoft\Windows\Appx\AllowAllTrustedApps", 1, RegistryValueKind.DWord);
            SetRegistryValue(@"OSDATA\SOFTWARE\Microsoft\SecurityManager\InternalDevUnlock", 1, RegistryValueKind.DWord);
            SetRegistryValue(@"OSDATA\Cloud Settings Cache\7E27AE37-A2D1-423E-ACD2-8D3357F894C9", 1, RegistryValueKind.DWord);
        }
    }

    // public static async Task InstallApp(string path)
    public static void InstallApp(string path)
    {
        // Temporarily disable these codes until I find other way to install appx
        // var pathUri = new Uri(path);

        // await packageManager.AddPackageAsync(pathUri, null, DeploymentOptions.None).AsTask();

        using (Process process = new Process())
        {
            process.StartInfo.FileName = "MinDeployAppx.exe";
            process.StartInfo.Arguments = $"/Add /PackagePath:\"{path}\" /DeploymentOption:0x00808000";
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.Start();
            process.WaitForExit();
            if (process.ExitCode != 0)
            {
                throw new Exception($"Failed to install package: {process.ExitCode}");
            }
        }
    }
}