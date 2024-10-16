using System.Diagnostics;

class ProcessContainer
{
    public int Id { get; init; }
    public string Name { get; init; }
    public long Memory { get; init; }
    public bool Responding { get; init; }

    public ProcessContainer(Process process)
    {
        Id = process.Id;
        Name = process.ProcessName;
        Memory = process.WorkingSet64;
        Responding = process.Responding;
    }
}