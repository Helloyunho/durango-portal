using System.Diagnostics;

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
}