using System.Diagnostics;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Win32;
using Windows.ApplicationModel;
using Windows.Management.Deployment;

class PackageContainer
{
    public string Name { get; set; }
    public string Id { get; set; }

    public PackageContainer(Package package)
    {
        Name = package.DisplayName;
        Id = package.Id.FullName;
    }
}

class AppManager
{
    private static PackageManager packageManager = new PackageManager();

    public static PackageContainer[] GetInstalledApps()
    {
        return packageManager.FindPackages().Select(package => new PackageContainer(package)).ToArray();
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

    public static void EnableSideloadedApps()
    {
        using (RegistryKey HKLM = Registry.LocalMachine)
        {
            HKLM.SetValue(@"SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock\AllowDevelopmentWithoutDevLicense", 1, RegistryValueKind.DWord);
            HKLM.SetValue(@"SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock\AllowAllTrustedApps", 1, RegistryValueKind.DWord);
            HKLM.SetValue(@"SOFTWARE\Policies\Microsoft\Windows\Appx\AllowDevelopmentWithoutDevLicense", 1, RegistryValueKind.DWord);
            HKLM.SetValue(@"SOFTWARE\Policies\Microsoft\Windows\Appx\AllowAllTrustedApps", 1, RegistryValueKind.DWord);
            HKLM.SetValue(@"OSDATA\SOFTWARE\Microsoft\SecurityManager\InternalDevUnlock", 1, RegistryValueKind.DWord);
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