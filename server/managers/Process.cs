using System.Diagnostics;

class ProcessManager
{
    public static Process[] Processes => Process.GetProcesses();

    public static ProcessContainer[] GetProcesses()
    {
        Process[] processes = Processes;
        ProcessContainer[] ProcessContainers = new ProcessContainer[processes.Length];
        for (int i = 0; i < processes.Length; i++)
        {
            ProcessContainers[i] = new ProcessContainer(processes[i]);
        }
        return ProcessContainers;
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