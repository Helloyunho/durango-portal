using System.Diagnostics;

class ProcessJson
{
    public int Id { get; init; }
    public string Name { get; init; }
    public long Memory { get; init; }
    public bool Responding { get; init; }

    public ProcessJson(Process process)
    {
        Id = process.Id;
        Name = process.ProcessName;
        Memory = process.WorkingSet64;
        Responding = process.Responding;
    }
}

class ProcessManager
{
    public static Process[] Processes => Process.GetProcesses();

    public static ProcessJson[] GetProcesses()
    {
        Process[] processes = Processes;
        ProcessJson[] processJsons = new ProcessJson[processes.Length];
        for (int i = 0; i < processes.Length; i++)
        {
            processJsons[i] = new ProcessJson(processes[i]);
        }
        return processJsons;
    }

    public static void KillProcess(int id)
    {
        Process.GetProcessById(id).Kill();
    }

    public static void KillProcess(string name)
    {
        Process.GetProcessesByName(name).ToList().ForEach(p => p.Kill());
    }
}