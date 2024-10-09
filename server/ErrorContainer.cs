class ErrorContainer
{
    public string Message { get; init; } = "";
    public string? StackTrace { get; init; } = "";

    public ErrorContainer(Exception e)
    {
        Message = e.Message;
        StackTrace = e.StackTrace;
    }

    public ErrorContainer(string message)
    {
        Message = message;
    }
}