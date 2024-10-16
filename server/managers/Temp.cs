class TempManager : IDisposable
{
    string tempDir;
    public TempManager()
    {
        tempDir = Path.Combine(AppContext.BaseDirectory, "tmp" + Path.GetRandomFileName());
        if (!Directory.Exists(tempDir))
        {
            Directory.CreateDirectory(tempDir);
        }
    }

    public string GetTempFilePath(string extension)
    {
        string fileName = Path.GetRandomFileName() + extension;
        return Path.Combine(tempDir, fileName);
    }

    public void DeleteTempFile(string path)
    {
        if (File.Exists(path))
        {
            File.Delete(path);
        }
    }

    public void DeleteTempDir()
    {
        if (Directory.Exists(tempDir))
        {
            Directory.Delete(tempDir, true);
        }
    }

    public void Dispose()
    {
        DeleteTempDir();
    }
}