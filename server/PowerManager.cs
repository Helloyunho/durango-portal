using Windows.System;

class PowerManager
{
    public static void Shutdown()
    {
        ShutdownManager.BeginShutdown(ShutdownKind.Shutdown, new TimeSpan(0));
    }

    public static void Reboot()
    {
        ShutdownManager.BeginShutdown(ShutdownKind.Restart, new TimeSpan(0));
    }
}