using Windows.System;

class PowerManager
{
    public static void Shutdown()
    {
        Windows.System.ShutdownManager.BeginShutdown(Windows.System.ShutdownKind.Shutdown, new TimeSpan(0));
    }

    public static void Reboot()
    {
        Windows.System.ShutdownManager.BeginShutdown(Windows.System.ShutdownKind.Restart, new TimeSpan(0));
    }
}