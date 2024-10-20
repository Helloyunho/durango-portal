using Microsoft.Win32;

public class RegistryManager
{
    public static RegistryKey GetRegistryKey(string key)
    {
        return key switch
        {
            "HKLM" => Registry.LocalMachine,
            "HKEY_LOCAL_MACHINE" => Registry.LocalMachine,
            "HKCU" => Registry.CurrentUser,
            "HKEY_CURRENT_USER" => Registry.CurrentUser,
            "HKCR" => Registry.ClassesRoot,
            "HKEY_CLASSES_ROOT" => Registry.ClassesRoot,
            "HKU" => Registry.Users,
            "HKEY_USERS" => Registry.Users,
            "HKCC" => Registry.CurrentConfig,
            "HKEY_CURRENT_CONFIG" => Registry.CurrentConfig,
            _ => throw new ArgumentException("Invalid registry key")
        };
    }

    public static void SetValue(string key, object value, RegistryValueKind kind)
    {
        string[] keys = key.Split('\\');
        RegistryKey rootKey = GetRegistryKey(keys[0]);
        using (rootKey)
        {
            RegistryKey? currentKey = rootKey;
            foreach (string k in keys[1..^1])
            {
                currentKey = currentKey.CreateSubKey(k);
                if (currentKey == null)
                {
                    throw new ArgumentException("Invalid registry key");
                }
            }
            currentKey.SetValue(keys[^1], value, kind);
        }
    }

    public static object GetValue(string key)
    {
        string[] keys = key.Split('\\');
        RegistryKey rootKey = GetRegistryKey(keys[0]);
        using (rootKey)
        {
            RegistryKey? currentKey = rootKey;
            foreach (string k in keys[1..^1])
            {
                currentKey = currentKey.OpenSubKey(k);
                if (currentKey == null)
                {
                    throw new ArgumentException("Invalid registry key");
                }
            }
            var value = currentKey.GetValue(keys[^1]);
            if (value == null)
            {
                throw new ArgumentException("Invalid registry key");
            }
            return value;
        }
    }

    public static void DeleteValue(string key)
    {
        string[] keys = key.Split('\\');
        RegistryKey rootKey = GetRegistryKey(keys[0]);
        using (rootKey)
        {
            RegistryKey? currentKey = rootKey;
            foreach (string k in keys[1..^1])
            {
                currentKey = currentKey.OpenSubKey(k, true);
                if (currentKey == null)
                {
                    throw new ArgumentException("Invalid registry key");
                }
            }
            currentKey.DeleteValue(keys[^1]);
        }
    }

    public static void DeleteKey(string key)
    {
        string[] keys = key.Split('\\');
        RegistryKey rootKey = GetRegistryKey(keys[0]);
        using (rootKey)
        {
            RegistryKey? currentKey = rootKey;
            foreach (string k in keys[1..^1])
            {
                currentKey = currentKey.OpenSubKey(k, true);
                if (currentKey == null)
                {
                    throw new ArgumentException("Invalid registry key");
                }
            }
            currentKey.DeleteSubKeyTree(keys[^1]);
        }
    }

    public static string[] GetSubKeys(string key)
    {
        string[] keys = key.Split('\\');
        RegistryKey rootKey = GetRegistryKey(keys[0]);
        using (rootKey)
        {
            RegistryKey? currentKey = rootKey;
            foreach (string k in keys[1..])
            {
                currentKey = currentKey.OpenSubKey(k);
                if (currentKey == null)
                {
                    throw new ArgumentException("Invalid registry key");
                }
            }
            return currentKey.GetSubKeyNames();
        }
    }

    public static RegistryValueContainer[] GetValues(string key)
    {
        string[] keys = key.Split('\\');
        RegistryKey rootKey = GetRegistryKey(keys[0]);
        using (rootKey)
        {
            RegistryKey? currentKey = rootKey;
            foreach (string k in keys[1..])
            {
                currentKey = currentKey.OpenSubKey(k);
                if (currentKey == null)
                {
                    throw new ArgumentException("Invalid registry key");
                }
            }
            return currentKey
                .GetValueNames()
                .Select(
                    name => new RegistryValueContainer(
                        key,
                        currentKey.GetValue(name)!,
                        currentKey.GetValueKind(name)
                    )
                    ).ToArray();
        }
    }

    public static void CreateKey(string key)
    {
        string[] keys = key.Split('\\');
        RegistryKey rootKey = GetRegistryKey(keys[0]);
        using (rootKey)
        {
            RegistryKey currentKey = rootKey;
            foreach (string k in keys[1..^1])
            {
                currentKey = currentKey.CreateSubKey(k);
            }
        }
    }
}