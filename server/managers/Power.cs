using Windows.Xbox.System.Internal.Power;

class PowerManager
{
    public static void Shutdown()
    {
        PowerProperties.ShutDownConsole();
    }

    public static void Reboot()
    {
        PowerProperties.RestartConsole();
    }
}
