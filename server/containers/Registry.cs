using Microsoft.Win32;

public class RegistryValueContainer
{
    public RegistryValueKind Kind { get; init; }
    public string Key { get; init; }
    public object Value { get; init; }

    public RegistryValueContainer(string key, object value, RegistryValueKind kind)
    {
        Key = key;
        Value = value;
        Kind = kind;
    }
}